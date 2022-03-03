import { DB_DATABASE, DB_HOST, DB_PORT, DB_USER } from './src/dependencies/config'

export default {
  type: 'mariadb',
  dbName: DB_DATABASE,
  user: DB_USER,
  host: DB_HOST,
  port: DB_PORT,
  debug: true,
  entities: [
    './src/types/entities/*.ts',
    './src/types/embeddables/*.ts'
  ]
}
