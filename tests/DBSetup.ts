import { getConnection, closeConnection } from './createConnection'

beforeAll(async () => {
  await getConnection()
})

afterAll(async () => {
  await closeConnection()
})
