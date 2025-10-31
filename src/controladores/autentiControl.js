import jwt from 'jsonwebtoken';
import { conmysql } from '../db.js';
import { JWT_SECRET } from '../config.js';
import crypto from 'crypto';

// 🔐 LOGIN
export const login = async (req, res) => {
  const { usr_usuario, usr_clave } = req.body;

  try {
    // Buscar usuario en la base de datos
    const [rows] = await conmysql.query(
      'SELECT * FROM usuarios WHERE usr_usuario = ?',
      [usr_usuario]
    );

    if (rows.length === 0) {
      // 🟥 Usuario no existe
      return res.status(404).json({ estado: 0, error: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    // Calcular hash MD5 de la clave ingresada
    const hashIngresado = crypto.createHash('md5').update(usr_clave).digest('hex');

    if (hashIngresado !== usuario.usr_clave) {
      // 🟥 Contraseña incorrecta
      return res.status(401).json({ estado: 0, error: 'Contraseña incorrecta' });
    }

    // 🟢 Usuario válido → generar token JWT
    const token = jwt.sign(
      {
        id: usuario.usr_id,
        usuario: usuario.usr_usuario,
        nombre: usuario.usr_nombre
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // ✅ Respuesta exitosa
    res.json({
      estado: 1,
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.usr_id,
        nombre: usuario.usr_nombre,
        correo: usuario.usr_correo
      }
    });

  } catch (error) {
    console.error('🔴 Error en login:', error);
    res.status(500).json({ estado: 0, error: 'Error interno del servidor' });
  }
};
