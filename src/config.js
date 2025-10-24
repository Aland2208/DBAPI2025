import {config} from 'dotenv'
config()

export const BD_HOST=process.env.BD_HOST || 'bu4jzgpw41nahtefkqe6-mysql.services.clever-cloud.com'
export const BD_DATABASE=process.env.BD_DATABASE || 'bu4jzgpw41nahtefkqe6'
export const BD_USER=process.env.BD_USER ||'uj3iqphebuhng4wm'
export const BD_PASSWORD=process.env.BD_PASSWORD || 'kIfwbeCuTqCSifyVST5o'
export const BD_PORT=process.env.BD_PORT || 3306
export const PORT=process.env.PORT || 3000

export const JWT_SECRET = process.env.JWT_SECRET || 'clave_por_defecto'