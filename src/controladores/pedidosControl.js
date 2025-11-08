import { conmysql } from '../db.js';

// ======================================================
// 🟢 Obtener todos los pedidos con sus detalles
// ======================================================
export const getPedidos = async (req, res) => {
    try {
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

        if (pedidos.length === 0)
            return res.json({ cantidad: 0, data: [] });

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

        const pedidosConDetalles = pedidos.map(p => {
            const det = detalles.filter(d => d.ped_id === p.ped_id);
            const total = det.reduce((acc, item) => acc + Number(item.subtotal), 0);
            return { ...p, total_pedido: total, detalles: det };
        });

        res.json({ cantidad: pedidosConDetalles.length, data: pedidosConDetalles });
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// ======================================================
// 🟢 Obtener pedido por ID
// ======================================================
export const getPedidosxID = async (req, res) => {
    try {
        const { id } = req.params;

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

        if (pedidoResult.length === 0)
            return res.status(404).json({ message: 'Pedido no encontrado' });

        const pedido = pedidoResult[0];

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

        res.json({ ...pedido, detalles });
    } catch (error) {
        console.error('Error al obtener pedido por ID:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// ======================================================
// 🟢 Crear pedido con detalles
// ======================================================
export const postPedido = async (req, res) => {
    const connection = await conmysql.getConnection();
    try {
        const { cli_id, usr_id, detalles } = req.body;

        if (!cli_id || !usr_id)
            return res.status(400).json({ message: 'cli_id y usr_id son obligatorios' });

        if (!Array.isArray(detalles) || detalles.length === 0)
            return res.status(400).json({ message: 'detalles debe contener al menos 1 producto' });

        await connection.beginTransaction();

        // 🟢 Insertar pedido principal
        const [pedidoResult] = await connection.query(
            'INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?, NOW(), ?, 1)',
            [cli_id, usr_id]
        );
        const ped_id = pedidoResult.insertId;

        // 🟢 Insertar cada producto del carrito
        for (const item of detalles) {
            const prod_id = Number(item.prod_id);
            const det_cantidad = Number(item.det_cantidad);
            const det_precio = Number(item.det_precio);

            if (!prod_id || det_cantidad <= 0 || isNaN(det_precio)) {
                throw new Error(`Datos inválidos en detalle: ${JSON.stringify(item)}`);
            }

            await connection.query(
                'INSERT INTO pedidos_detalle (prod_id, ped_id, det_cantidad, det_precio) VALUES (?, ?, ?, ?)',
                [prod_id, ped_id, det_cantidad, det_precio]
            );
        }

        await connection.commit();
        res.status(201).json({ message: '✅ Pedido registrado correctamente', ped_id });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error al registrar pedido:', error);
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};
