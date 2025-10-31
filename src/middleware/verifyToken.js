import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

export const verifyToken = (req, res, next) => {
  const header = req.headers['authorization'];

  // 🔴 Si no se envió el header Authorization
  if (!header) {
    return res.status(403).json({ estado: 0, error: 'Token requerido' });
  }

  const token = header.split(' ')[1]; // formato: Bearer <token>

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // ✅ token correcto
    next(); // pasa al siguiente middleware/controlador
  } catch (error) {
    // 🔴 Token inválido o expirado
    return res.status(401).json({ estado: 0, error: 'Token inválido o expirado' });
  }
};
