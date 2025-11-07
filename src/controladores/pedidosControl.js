import { conmysql } from '../db.js'

export const getPedidos = async (req, res) => {
    try {
        // 1. Obtener todos los pedidos
        const [pedidos] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.cli_id,
                c.cli_nombre,
                p.ped_fecha,
                p.usr_id,
                u.usr_nombre,
                p.ped_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.cli_id = c.cli_id
            LEFT JOIN usuarios u ON p.usr_id = u.usr_id
            ORDER BY p.ped_id DESC
        `);

        // 2. Si no hay pedidos
        if (pedidos.length === 0) {
            return res.json({ cantidad: 0, data: [] });
        }

        // 3. Obtener todos los detalles en una sola consulta
        const [detalles] = await conmysql.query(`
            SELECT 
                d.ped_id,
                d.det_id,
                d.prod_id,
                pr.prod_nombre,
                d.det_cantidad,
                d.det_precio,
                (d.det_cantidad * d.det_precio) AS subtotal
            FROM pedidos_detalle d
            LEFT JOIN productos pr ON d.prod_id = pr.prod_id
        `);

        // 4. Agrupar detalles por pedido
        const pedidosConDetalles = pedidos.map(pedido => {
            const detallesPedido = detalles.filter(d => d.ped_id === pedido.ped_id);
            const total = detallesPedido.reduce((acc, item) => acc + Number(item.subtotal), 0);
            return {
                ...pedido,
                total_pedido: total,
                detalles: detallesPedido
            };
        });

        // 5. Responder al cliente
        res.json({
            cantidad: pedidosConDetalles.length,
            data: pedidosConDetalles
        });

    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

export const getPedidosxID = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Obtener el pedido principal
        const [pedidoResult] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.cli_id,
                c.cli_nombre,
                p.ped_fecha,
                p.usr_id,
                u.usr_nombre,
                p.ped_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.cli_id = c.cli_id
            LEFT JOIN usuarios u ON p.usr_id = u.usr_id
            WHERE p.ped_id = ?
        `, [id]);

        if (pedidoResult.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        const pedido = pedidoResult[0];

        // 2. Obtener los detalles del pedido
        const [detalles] = await conmysql.query(`
            SELECT 
                d.det_id,
                d.prod_id,
                pr.prod_nombre,
                d.det_cantidad,
                d.det_precio,
                (d.det_cantidad * d.det_precio) AS subtotal
            FROM pedidos_detalle d
            LEFT JOIN productos pr ON d.prod_id = pr.prod_id
            WHERE d.ped_id = ?
        `, [id]);

        // 3. Calcular el total del pedido
      //  const total_pedido = detalles.reduce((acc, item) => acc + Number(item.subtotal), 0);

        // 4. Construir respuesta final
        res.json({
            ...pedido,
           // total_pedido,
            detalles
        });

    } catch (error) {
        console.error("Error al obtener pedido por ID:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};


export const postPedido = async (req, res) => {
  const connection = await conmysql.getConnection();
  try {
    const { cli_id, usr_id, detalles } = req.body;

    // ✅ Validaciones claras
    if (!cli_id || !usr_id) {
      return res.status(400).json({ message: "cli_id y usr_id son obligatorios" });
    }
    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ message: "detalles debe ser un arreglo con al menos 1 ítem" });
    }

    // ✅ Normaliza y valida cada detalle
    const filas = [];
    for (const item of detalles) {
      const prod_id = Number(item?.prod_id);
      const det_cantidad = Number(item?.det_cantidad);
      const det_precio = Number(item?.det_precio);

      if (!prod_id || !det_cantidad || det_cantidad < 1 || isNaN(det_precio)) {
        return res.status(400).json({
          message: "Cada detalle debe tener prod_id, det_cantidad>=1 y det_precio numérico",
          detalle_recibido: item
        });
      }
      filas.push([prod_id, det_cantidad, det_precio]);
    }

    await connection.beginTransaction();

    // 1) Pedido maestro
    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?, NOW(), ?, 1)',
      [cli_id, usr_id]
    );
    const ped_id = pedidoResult.insertId;

    // 2) Detalles (bulk insert)
    // construimos VALUES (?, ?, ?, ?), (?, ?, ?, ?), ...
    const placeholders = filas.map(() => '(?, ?, ?, ?)').join(', ');
    const values = filas.flatMap(([prod_id, det_cantidad, det_precio]) => [prod_id, ped_id, det_cantidad, det_precio]);

    await connection.query(
      `INSERT INTO pedidos_detalle (prod_id, ped_id, det_cantidad, det_precio) VALUES ${placeholders}`,
      values
    );

    await connection.commit();
    res.status(201).json({ message: "Pedido registrado correctamente", ped_id });
  } catch (error) {
    await connection.rollback();
    console.error("Error al registrar el pedido:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  } finally {
    connection.release();
  }
};

