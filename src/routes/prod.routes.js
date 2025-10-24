import { Router } from 'express'
//importar las funciones
import { getProd, getProdxID, postProd, putProd, deleteProd } from '../controladores/prodControl.js';
import upload from '../middlewares/upload.js';

import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();
//armar nuestras rutas

router.get('/productos', verifyToken, getProd)
router.get('/productos/:id', verifyToken, getProdxID)
//router.post('/productos', verifyToken, postProd)
router.post('/productos', verifyToken, upload.single('imagen'), postProd)
//router.put('/productos/:id', verifyToken, putProd)
router.put('/productos/:id', verifyToken, upload.single('imagen'), putProd)
router.delete('/productos/:id', verifyToken, deleteProd)

export default router