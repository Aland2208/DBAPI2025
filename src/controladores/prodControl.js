import { conmysql } from '../db.js';


export const getProd = async (req, res) => {
  try {
    const [result] = await conmysql.query(`
      SELECT p.*, c.cat_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.cat_id = c.cat_id
    `);

    res.json({
      cantidad: result.length,
      data: result
    });

  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};


export const getProdxID = async (req, res) => {
  try {
    const [result] = await conmysql.query(`
      SELECT p.*, c.cat_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.cat_id = c.cat_id
      WHERE p.prod_id = ?
    `, [req.params.id]);

    if (result.length <= 0) {
      return res.json({ cantidad: 0, message: "Producto no encontrado" });
    }

    res.json({
      cantidad: 1,
      dataProd: result[0]
    });

  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
};


export const postProd = async (req, res) => {
  try {
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, cat_id } = req.body;
    const prod_imagen = req.file?.path || null;

    // Validar activo
    let activo = 0;
    const val = (prod_activo || '').toString().trim().toLowerCase();
    if (['1', 'true', 'on', 'checked'].includes(val)) activo = 1;

    // Validar duplicado
    const [existe] = await conmysql.query(
      'SELECT * FROM productos WHERE prod_codigo = ?',
      [prod_codigo]
    );
    if (existe.length > 0) {
      return res.status(400).json({ estado: 0, mensaje: `El código ${prod_codigo} ya existe` });
    }

    // Insertar
    const [result] = await conmysql.query(
      `INSERT INTO productos 
       (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen, cat_id)
       VALUES (?,?,?,?,?,?,?)`,
      [prod_codigo, prod_nombre, prod_stock, prod_precio, activo, prod_imagen, cat_id]
    );

    res.status(201).json({
      estado: 1,
      mensaje: 'Producto registrado exitosamente',
      data: { prod_id: result.insertId, prod_imagen }
    });

  } catch (error) {
    console.error('Error en postProd:', error);
    res.status(500).json({ estado: 0, mensaje: 'Error en el servidor' });
  }
};


export const putProd = async (req, res) => {
  try {
    const { id } = req.params;
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, cat_id } = req.body;
    let prod_imagen = req.file?.path || null;

    // Validar activo
    let activo = 0;
    const val = (prod_activo || '').toString().trim().toLowerCase();
    if (['1', 'true', 'on', 'checked'].includes(val)) activo = 1;

    // Validar duplicado
    const [dupli] = await conmysql.query(
      'SELECT * FROM productos WHERE prod_codigo = ? AND prod_id <> ?',
      [prod_codigo, id]
    );
    if (dupli.length > 0) {
      return res.status(400).json({ estado: 0, mensaje: `El código '${prod_codigo}' ya existe` });
    }

    // Mantener imagen actual si no se envía una nueva
    if (!prod_imagen) {
      const [imgActual] = await conmysql.query(
        'SELECT prod_imagen FROM productos WHERE prod_id = ?',
        [id]
      );
      if (imgActual.length > 0) prod_imagen = imgActual[0].prod_imagen;
    }

    // Actualizar
    const [result] = await conmysql.query(
      `UPDATE productos
       SET prod_codigo=?, prod_nombre=?, prod_stock=?, prod_precio=?, prod_activo=?, prod_imagen=?, cat_id=?
       WHERE prod_id=?`,
      [prod_codigo, prod_nombre, prod_stock, prod_precio, activo, prod_imagen, cat_id, id]
    );

    if (result.affectedRows <= 0) {
      return res.status(404).json({ estado: 0, mensaje: 'Producto no encontrado' });
    }

    const [fila] = await conmysql.query('SELECT * FROM productos WHERE prod_id = ?', [id]);
    res.json({ estado: 1, mensaje: 'Producto actualizado', data: fila[0] });

  } catch (error) {
    console.error('Error en putProd:', error);
    res.status(500).json({ estado: 0, mensaje: 'Error en el servidor' });
  }
};


export const deleteProd = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await conmysql.query('DELETE FROM productos WHERE prod_id = ?', [id]);

    if (result.affectedRows <= 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado correctamente" });

  } catch (error) {
    console.error("Error en deleteProd:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
