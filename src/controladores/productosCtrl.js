import { conmysql } from '../db.js'

export const getProductos = async (req, res) => {
    try {
        const [result] = await conmysql.query(' select * from productos')
        res.json({
            cantidad: result.length,
            data: result
        })
        // res.json(result)
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })
    }

}

export const getProductosxID = async (req, res) => {
    try {
        const [result] = await conmysql.query(' select * from productos where prod_id =?', [req.params.id])
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

//funcion para insertar un producto
export const postProductos = async (req, res) => {
    try {
        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen } = req.body
        //console.log(req.body)
        const [result] = await conmysql.query(
            'insert into productos(prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) values (?,?,?,?,?,?)',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen]
        )
        res.send({ prod_id: result.insertId })
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })
    }
}

//funcion para modificar
export const putProductos = async (req, res) => {
    try {
        const { id } = req.params
        const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen } = req.body
        /* console.log(req.body)
        console.log(id) */
        const [result] = await conmysql.query(
            'update productos set prod_codigo=?, prod_nombre=?, prod_stock=?, prod_precio=?, prod_activo=?, prod_imagen=? where prod_id=?',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen, id]
        )
        if (result.affectedRows <= 0) return res.status(404).json({
            message: "Producto no encontrado"
        })

        const [fila] = await conmysql.query(' select * from productos where prod_id =?', [id])
        res.json(fila[0])


    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })
    }
}

//funcion para eliminar
export const deleteProductos = async (req, res) => {
    try {
        const { id } = req.params
        /* console.log(req.body)
        console.log(id) */
        const [result] = await conmysql.query(
            'delete from productos where prod_id=?',
            [id]
        )
        if (result.affectedRows <= 0) return res.status(404).json({
            message: "Producto no encontrado"
        })
        res.json({
            message: "Producto eliminado"
        })
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })
    }
}
