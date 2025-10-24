import crypto from 'crypto';
import { conmysql } from '../db.js'


export const getUsuarios = async (req, res) => {
    try {
        const [result] = await conmysql.query(' select * from usuarios')   //es consulta el query
        res.json({
            cantidad: result.length,
            data: result
        })
        // res.json(result)
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })
    }
}

export const getUsuariosxID = async (req, res) => {
    try {
        const [result] = await conmysql.query(' select * from usuarios where usr_id =?', [req.params.id])   //es consulta el query
        if (result.length <= 0) return res.json({
            cantidad: 0,
            message: "Usuario no encontrado"
        })
        res.json({
            cantidad: result.length,
            data: result[0]
        })
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })
    }
}

//funcion para insertar un cliente   insert es con post   put es para todos los datos con un update y push con un solo objeto
//se envia un objeto en el cuerpo cada que se hace un post
export const postUsuario = async (req, res) => {
    try {
        const { usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo } = req.body;

        // 🔐 Encriptar contraseña en MD5
        const hashMD5 = crypto.createHash('md5').update(usr_clave).digest('hex');

        const [result] = await conmysql.query(
            'INSERT INTO usuarios (usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo) VALUES (?,?,?,?,?,?)',
            [usr_usuario, hashMD5, usr_nombre, usr_telefono, usr_correo, usr_activo]
        );

        res.status(201).json({
            message: 'Usuario creado correctamente',
            usr_id: result.insertId
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};


//funcion para modificar es decir un update     put para reemplazar todo el objeto y patch para solo ciertos campos
export const putUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo } = req.body;

        // 🔐 Si viene una nueva clave, encriptarla
        const hashMD5 = usr_clave
            ? crypto.createHash('md5').update(usr_clave).digest('hex')
            : null;

        // Actualizar
        const [result] = await conmysql.query(
            'UPDATE usuarios SET usr_usuario=?, usr_clave=?, usr_nombre=?, usr_telefono=?, usr_correo=?, usr_activo=? WHERE usr_id=?',
            [usr_usuario, hashMD5, usr_nombre, usr_telefono, usr_correo, usr_activo, id]
        );

        if (result.affectedRows <= 0) return res.status(404).json({ message: "Usuario no encontrado" });

        const [fila] = await conmysql.query('SELECT * FROM usuarios WHERE usr_id = ?', [id]);
        res.json(fila[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};


//funcion para eliminar
export const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params
        /* console.log(req.body)
        console.log(id) */
        const [result] = await conmysql.query(
            'delete from usuarios where usr_id=?',
            [id]
        )
        if (result.affectedRows <= 0) return res.status(404).json({
            message: "Usuario no encontrado"
        })
        res.json({
            message: "Usuario eliminado correctamente"
        })

    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" })
    }
}