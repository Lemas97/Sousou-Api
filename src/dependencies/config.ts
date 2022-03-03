import dotenv from 'dotenv'
import Debug from 'debug'
dotenv.config()

export const ENVIRONMENT = process.env.NODE_ENV as string || 'development'

export const HOST = process.env.HOST as string || '127.0.0.1'
export const PORT = parseInt(process.env.PORT as string) || 9999

export const DEBUG = process.env.DEBUG as string || ''

export const DB_HOST = process.env.DB_HOST ?? '127.0.0.1'
export const DB_PORT = process.env.DB_PORT !== undefined ? parseInt(process.env.DB_PORT) : 3306
export const DB_USER = process.env.DB_USER ?? 'root'
export const DB_PASSWORD = process.env.DB_PASSWORD ?? ''
export const DB_DATABASE = process.env.DB_DATABASE ?? 'discord_clone'

export const PRIVATE_KEY = process.env.PRIVATE_KEY as string ?? ''
export const PUBLIC_KEY = process.env.PUBLIC_KEY as string ?? ''

export const REGISTER_ROLE = process.env.REGISTER_ROLE as string

export const JWKSURI = process.env.JWKSURI as string
export const ISSUER = process.env.ISSUER as string

Debug.enable(DEBUG)
