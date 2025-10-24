import { Router } from 'express'
//importar las funciones 
import {getProductos, getProductosxID,postProductos, putProductos, deleteProductos } from '../controladores/productosCtrl.js'
const router = Router();
//armar nuestras rutas

router.get('/productos', getProductos)
router.get('/productos/:id', getProductosxID )
router.post('/productos', postProductos)
router.put('/productos/:id', putProductos)
router.delete('/productos/:id', deleteProductos)

export default router