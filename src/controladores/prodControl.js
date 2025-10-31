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
        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body;
        const prod_imagen = req.file ? `/uploads/${req.file.filename}` : null;

        // ✅ Convertir prod_activo (true/false) a número
        const activo = (prod_activo === 'true' || prod_activo === true) ? 1 : 0;

        // Verificar si ya existe un producto con el mismo código
        const [existe] = await conmysql.query(
            'SELECT * FROM productos WHERE prod_codigo = ?',
            [prod_codigo]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                message: `El código ${prod_codigo} ya existe, por favor usa otro.`
            });
        }

        // Insertar producto
        const [result] = await conmysql.query(
            'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) VALUES (?,?,?,?,?,?)',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, activo, prod_imagen]
        );

        res.status(201).json({
            message: "Producto registrado exitosamente",
            prod_id: result.insertId
        });

    } catch (error) {
        console.error("Error en postProd:", error);
        return res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};


//funcion para modificar es decir un update     put para reemplazar todo el objeto y patch para solo ciertos campos
export const putProd = async (req, res) => {
    try {
        const { id } = req.params;
        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo } = req.body;
        let prod_imagen = req.file ? `/uploads/${req.file.filename}` : null;

        // ✅ Convertir prod_activo a número
        const activo = (prod_activo === 'true' || prod_activo === true) ? 1 : 0;

        // Validar código duplicado
        const [existeCodigo] = await conmysql.query(
            'SELECT * FROM productos WHERE prod_codigo = ? AND prod_id <> ?',
            [prod_codigo, id]
        );

        if (existeCodigo.length > 0) {
            return res.status(400).json({
                message: `El código '${prod_codigo}' ya está registrado en otro producto`
            });
        }

        // Si no hay nueva imagen, conservar la actual
        if (!prod_imagen) {
            const [imgActual] = await conmysql.query(
                'SELECT prod_imagen FROM productos WHERE prod_id = ?',
                [id]
            );

            if (imgActual.length > 0) {
                prod_imagen = imgActual[0].prod_imagen;
            }
        }

        // Actualizar producto
        const [result] = await conmysql.query(
            'UPDATE productos SET prod_codigo=?, prod_nombre=?, prod_stock=?, prod_precio=?, prod_activo=?, prod_imagen=? WHERE prod_id=?',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, activo, prod_imagen, id]
        );

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        const [fila] = await conmysql.query('SELECT * FROM productos WHERE prod_id = ?', [id]);
        res.json({
            message: 'Producto actualizado correctamente',
            data: fila[0]
        });

    } catch (error) {
        console.error("Error en putProd:", error);
        return res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};


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