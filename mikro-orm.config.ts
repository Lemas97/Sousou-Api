import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from './src/dependencies/config'

export default {
  type: 'mysql',
  dbName: DB_DATABASE,
  user: DB_USER,
  host: DB_HOST,
  port: DB_PORT,
  password: DB_PASSWORD,
  debug: false,
  migrations: {
    glob: '!(*.d).{js,ts}',
    pathTs: './migrations',
    snapshot: false,
    emit: 'ts'
  },
  entities: [
    './src/types/embeddables/*.ts',
    './src/types/embeddables/*.js',
    './src/types/entities/*.ts',
    './src/types/entities/*.js'
  ]
}
