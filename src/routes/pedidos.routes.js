import { Router } from 'express'
//importar las funciones
import { getPedidos, getPedidosxID, postPedido } from '../controladores/pedidosControl.js'

import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();
//armar nuestras rutas
//router.get('/clientes', prueba)

router.get('/pedidos', verifyToken, getPedidos)
router.get('/pedidos/:id', verifyToken, getPedidosxID)
router.post('/pedidos', verifyToken, postPedido)



export default router