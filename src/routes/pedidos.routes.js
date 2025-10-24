import { Router } from 'express'
//importar las funciones
import { getPedidos, getPedidosxID, postPedido } from '../controladores/pedidosControl.js'

import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();
//armar nuestras rutas
//router.get('/clientes', prueba)

router.get('/pedidos', getPedidos)
router.get('/pedidos/:id', getPedidosxID)
router.post('/pedidos', postPedido)



export default router