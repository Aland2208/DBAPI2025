import { Router } from 'express';
import { getPedidos, getPedidosxID, postPedido, getPedidosPorFecha } from '../controladores/pedidosControl.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

router.get('/pedidos', verifyToken, getPedidos);
router.get('/pedidos/fecha', verifyToken, getPedidosPorFecha);
router.get('/pedidos/:id', verifyToken, getPedidosxID);
router.post('/pedidos', verifyToken, postPedido);



export default router;
