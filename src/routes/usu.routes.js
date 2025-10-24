import { Router } from 'express'
//importar las funciones
import { getUsuarios, getUsuariosxID, postUsuario, putUsuario, deleteUsuario } from '../controladores/usuControl.js'

import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();
//armar nuestras rutas


router.get('/usuarios', verifyToken, getUsuarios)
router.get('/usuarios/:id', verifyToken, getUsuariosxID)
router.post('/usuarios', verifyToken, postUsuario)
router.put('/usuarios/:id', verifyToken, putUsuario)
router.delete('/usuarios/:id', verifyToken, deleteUsuario)


export default router