import jwt from 'jsonwebtoken';
import { JWT } from '../config.js';

export const verificacionToken = (req, res, next) => {
  const header = req.headers['authorization'];

  if (!header) {
    return res.status(403).json({ message: 'Token requerido' });
  }

  const token = header.split(' ')[1]; // formato: Bearer <token>

  try {
    const decoded = jwt.verify(token, JWT);
    req.usuario = decoded; // COn esto ahora todas las rutas protegidas sabrán quién es el usuario
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
