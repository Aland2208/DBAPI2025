import express from 'express'
import cors from 'cors'

//importar las rutas OJO
import clientesRouters from './routes/clientes.routes.js'
import prodRouters from './routes/prod.routes.js'
import autentiRouters from './routes/autenti.routes.js'
import usuRouters from './routes/usu.routes.js'
import pedidosRoutes from './routes/pedidos.routes.js'

const app = express();
app.use(express.json()); //la app trabajara con json

const corsOptions = {
    origin: '*',   //direccion del dominio va aqui o todas las que se usaran
    methods:['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],         //metdoos que le doy permiso
    credentials:true     //habilitar credenciales
}
app.use(cors());

// indicar las rutas a utilizar OJO
app.use('/api', clientesRouters)
app.use('/api', prodRouters)
app.use('/api/autenti', autentiRouters);
app.use('/api', usuRouters)
app.use('/api', pedidosRoutes)

app.use((req, resp, next) => {
    resp.status(400).json({
        message: 'Endpoint not fount'
    })
})

export default app;