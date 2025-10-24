import { Router } from 'express'
//importar las funciones
import { prueba, getClientes, getClientesxID, postCliente, putCliente, deleteCliente } from '../controladores/clientesControl.js'

import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();
//armar nuestras rutas
//router.get('/clientes', prueba)

router.get('/clientes', verifyToken, getClientes)
router.get('/clientes/:id', verifyToken, getClientesxID)
router.post('/clientes', verifyToken, postCliente)
router.put('/clientes/:id', verifyToken, putCliente)
router.delete('/clientes/:id', verifyToken, deleteCliente)


export default router