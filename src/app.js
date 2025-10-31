import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

// importar las rutas
import clientesRouters from './routes/clientes.routes.js'
import prodRouters from './routes/prod.routes.js'
import autentiRouters from './routes/autenti.routes.js'
import usuRouters from './routes/usu.routes.js'
import pedidosRoutes from './routes/pedidos.routes.js'

// ✅ Corrección de __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // permite formularios

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}
app.use(cors(corsOptions))

// ✅ Esta línea no la necesitas si usas Cloudinary
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api', clientesRouters)
app.use('/api', prodRouters)
app.use('/api/autenti', autentiRouters)
app.use('/api', usuRouters)
app.use('/api', pedidosRoutes)

app.use((req, resp) => {
  resp.status(404).json({ message: 'Endpoint not found' })
})

export default app
