import 'reflect-metadata'

import cors from '@koa/cors'
import Koa, { Context } from 'koa'
import { ApolloServer } from 'apollo-server-koa'
import { createServer } from 'http'

import { MikroORM } from '@mikro-orm/core'

import { buildSchema } from 'type-graphql'

import { ENVIRONMENT, HOST, PORT, PRIVATE_KEY } from 'src/dependencies/config'
import { CustomContext } from './types/interfaces/CustomContext'
import { UserResolver } from './lib/resolvers/UserResolver'
import { FriendRequestResolver } from './lib/resolvers/FriendRequestResolver'
import { GroupResolver } from './lib/resolvers/GroupResolver'
import { isLogged } from './middlewares/guards/IsLogged'
import jwt from 'koa-jwt'
import { setStateUser } from './middlewares/SetStateUser'

async function main (): Promise<void> {
  console.log(`ENVIRONMENT: ${ENVIRONMENT}`)
  console.log('=== SETUP DATABASE ===')
  const connection = await MikroORM.init()

  console.log('=== BUILDING GQL SCHEMA ===')
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      FriendRequestResolver,
      GroupResolver

    ],
    globalMiddlewares: [isLogged]
  })

  const apolloServer = new ApolloServer({
    schema,
    context ({ ctx }: { ctx: Context }): CustomContext {
      return {
        ctx,
        state: ctx.state,
        em: connection.em.fork(),
        dataLoader: true
      }
    }
  })

  const app = new Koa()

  if (ENVIRONMENT === 'production') {
    app.proxy = true
  }

  await apolloServer.start()

  app.use(cors())

  app.use(jwt({ secret: PRIVATE_KEY, passthrough: true }))

  app.use(setStateUser(connection.em.fork()))

  app.use(apolloServer.getMiddleware({ cors: app.proxy }))

  const httpServer = createServer(app.callback())

  httpServer.listen({ port: PORT }, () => {
    console.log(`http://${HOST}:${PORT}/graphql`)
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
