import jwt from 'jsonwebtoken';
import { conmysql } from '../db.js';
import { JWT_SECRET } from '../config.js';
import crypto from 'crypto';

//"LOGIN"

export const login = async (req, res) => {
    const { usr_usuario, usr_clave } = req.body;

    try {
        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE usr_usuario = ?', [usr_usuario]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        const usuario = rows[0];

        // calcular MD5 del password ingresado
        const hashIngresado = crypto.createHash('md5').update(usr_clave).digest('hex');

        if (hashIngresado !== usuario.usr_clave) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: usuario.usr_id, usuario: usuario.usr_usuario, nombre: usuario.usr_nombre },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            usuario: { id: usuario.usr_id, nombre: usuario.usr_nombre, correo: usuario.usr_correo }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
