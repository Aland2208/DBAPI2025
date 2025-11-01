import { conmysql } from '../db.js'

export const getProd = async (req, res) => {
  try {
    const [result] = await conmysql.query(' select * from productos')   //es consulta el query
    res.json({
      cantidad: result.length,
      data: result
    })
    // res.json(result)
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" })
  }
}

export const getProdxID = async (req, res) => {
  try {
    const [result] = await conmysql.query(' select * from productos where prod_id =?', [req.params.id])   //es consulta el query
    if (result.length <= 0) return res.json({
      cantidad: 0,
      message: "Producto no encontrado"
    })
    res.json({
      cantidad: result.length,
      dataProd: result[0]
    })
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" })
  }
}

//funcion para insertar un cliente   insert es con post   put es para todos los datos con un update y push con un solo objeto
//se envia un objeto en el cuerpo cada que se hace un post(un insert ya que post es eso un insert)
export const postProd = async (req, res) => {
  try {
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body
    const prod_imagen = req.file?.path || null // ✅ URL de Cloudinary

    // 🟢 Interpretar correctamente el valor de prod_activo
    let activo = 0;
    const valor = (req.body.prod_activo || '').toString().trim().toLowerCase();
    if (valor === '1' || valor === 'true' || valor === 'on' || valor === 'checked') {
      activo = 1;
    }

    // Verificar duplicado
    const [existe] = await conmysql.query(
      'SELECT * FROM productos WHERE prod_codigo = ?',
      [prod_codigo]
    )
    if (existe.length > 0) {
      return res.status(400).json({ estado: 0, mensaje: `El código ${prod_codigo} ya existe` })
    }

    const [result] = await conmysql.query(
      'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) VALUES (?,?,?,?,?,?)',
      [prod_codigo, prod_nombre, prod_stock, prod_precio, activo, prod_imagen]
    )

    // 🟢 Nuevo formato de respuesta
    res.status(201).json({
      estado: 1,
      mensaje: 'Producto registrado exitosamente',
      data: {
        prod_id: result.insertId,
        prod_imagen: prod_imagen
      }
    })
  } catch (error) {
    console.error('Error en postProd:', error)
    res.status(500).json({ estado: 0, mensaje: 'Error en el servidor', error: error.message })
  }
}


//funcion para modificar es decir un update     put para reemplazar todo el objeto y patch para solo ciertos campos
export const putProd = async (req, res) => {
  try {
    const { id } = req.params
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body
    let prod_imagen = req.file?.path || null // ✅ URL Cloudinary

    // 🟢 Interpretar correctamente el valor de prod_activo
    let activo = 0;
    const valor = (req.body.prod_activo || '').toString().trim().toLowerCase();
    if (valor === '1' || valor === 'true' || valor === 'on' || valor === 'checked') {
      activo = 1;
    }

    // Validar código duplicado
    const [existeCodigo] = await conmysql.query(
      'SELECT * FROM productos WHERE prod_codigo = ? AND prod_id <> ?',
      [prod_codigo, id]
    )
    if (existeCodigo.length > 0) {
      return res.status(400).json({ estado: 0, mensaje: `El código '${prod_codigo}' ya existe en otro producto` })
    }

    // Mantener imagen actual si no se envía nueva
    if (!prod_imagen) {
      const [imgActual] = await conmysql.query(
        'SELECT prod_imagen FROM productos WHERE prod_id = ?',
        [id]
      )
      if (imgActual.length > 0) {
        prod_imagen = imgActual[0].prod_imagen
      }
    }

    // Actualizar
    const [result] = await conmysql.query(
      'UPDATE productos SET prod_codigo=?, prod_nombre=?, prod_stock=?, prod_precio=?, prod_activo=?, prod_imagen=? WHERE prod_id=?',
      [prod_codigo, prod_nombre, prod_stock, prod_precio, activo, prod_imagen, id]
    )

    if (result.affectedRows <= 0) {
      return res.status(404).json({ estado: 0, mensaje: 'Producto no encontrado' })
    }

    const [fila] = await conmysql.query('SELECT * FROM productos WHERE prod_id = ?', [id])
    res.json({ estado: 1, mensaje: 'Producto actualizado', data: fila[0] })
  } catch (error) {
    console.error('Error en putProd:', error)
    res.status(500).json({ estado: 0, mensaje: 'Error en el servidor', error: error.message })
  }
}


//funcion para eliminar
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
}