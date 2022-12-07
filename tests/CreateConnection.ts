import { MikroORM } from '@mikro-orm/core'

let connection: MikroORM | undefined

export async function getConnection (): Promise<MikroORM> {
  if (connection === undefined) {
    connection = await MikroORM.init({
      type: 'sqlite',
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      dbName: 'test',
      entities: [
        '../../types/entities/*.ts',
        '../../types/embeddables/*.ts'
      ]
    })

    await connection.getSchemaGenerator().dropSchema()
    await connection.getSchemaGenerator().createSchema()
  }

  return connection
}

export async function closeConnection (): Promise<void> {
  if (connection !== undefined) {
    await connection.close()
  }
  connection = undefined
}
