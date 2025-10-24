import express from 'express'
//importar las rutas OJO
import clientesRoutes from './routes/clientes.routes.js'
import productosRoutes from './routes/productos.routes.js'
import autenticacionRouters from './routes/autenticacion.routes.js'
const app= express();
app.use(express.json());

//indicar las rutas a utilizar OJO
app.use('/api',clientesRoutes)
app.use('/api',productosRoutes)
app.use('/api/autenti', autenticacionRouters);

app.use((req,resp,next)=>{
    resp.status(400).json({
        message:'Endpoint not fount'
    })
})

export default app;