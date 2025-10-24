import { conmysql } from '../db.js'

export const prueba = (req, res) => {
    res.send(' prueba con exito');
}

export const getClientes = async (req, res) => {
    try {
        const [result] = await conmysql.query(' select * from clientes where cli_id')
        res.json({
            cant: result.length,
            data: result
        })
    } catch (error) {
        return res.status(500).json({ message: "error en el servidor" })

    }

}
export const getClientesxID = async (req, res) => {
    try {
        const [result] = await conmysql.query(' select * from clientes where cli_id =?', [req.params.id])   //es consulta el query
        if (result.length <= 0) return res.json({
            cantidad: 0,
            message: "Cliente no encontrado"
        })
        res.json({
            cantidad: result.length,
            data: result[0]
        })
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })
    }
}

//funcion para insertar un cliente
export const postCliente = async (req, res) => {
    try {
        const { cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad } = req.body
        //console.log(req.body)
        const [result] = await conmysql.query(
            'insert into clientes(cli_identificacion,cli_nombre,cli_telefono,cli_correo,cli_direccion,cli_pais,cli_ciudad) values (?,?,?,?,?,?,?)',
            [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad]
        )
        res.send({ cli_id: result.insertId })

    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })

    }
}

//funcion para modificar
export const putCliente = async (req, res) => {
    try {
        const { id } = req.params
        const { cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad } = req.body
        /*console.log(req.body)
        console.log(id)
        */
        const [result] = await conmysql.query(
            'update clientes set cli_identificacion=?,cli_nombre=?,cli_telefono=?,cli_correo=?,cli_direccion=?,cli_pais=?,cli_ciudad=? where cli_id=?',
            [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad, id]
        )
        if (result.affectedRows <= 0) return res.status(404).json({
            message: "Cliente no encontrado"
        })
        const [fila] = await conmysql.query(' select * from clientes where cli_id =?', [id])
        res.json(fila[0])

    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })

    }
}
//funcion para eliminar
export const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;


        const [result] = await conmysql.query(
            'delete from clientes where cli_id = ?',
            [id]
        );
        if (result.affectedRows <= 0) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }
        res.json({
            message: "Cliente eliminado"
        });

    } catch (error) {
       return res.status(500).json({ message: "Error en el servidor" })
    }
}
