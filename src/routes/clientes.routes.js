import { Router } from 'express'
//importar las funciones 
import { prueba, getClientes, getClientesxID,postCliente, putCliente, deleteCliente } from '../controladores/clientesCtrl.js'
import { verificacionToken } from '../middleware/verificacionToken.js'
const router = Router();
//armar nuestras rutas
//router.get('/clientes',prueba)
router.get('/clientes', verificacionToken, getClientes)
router.get('/clientes/:id', verificacionToken, getClientesxID )
router.post('/clientes', verificacionToken, postCliente)
router.put('/clientes/:id', verificacionToken, putCliente)
router.delete('/clientes/:id', verificacionToken, deleteCliente)




export default router