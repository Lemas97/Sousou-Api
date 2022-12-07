import {} from 'reflect-metadata'

import { createServer } from 'http'
import { ApolloServer } from 'apollo-server-koa'
import Koa, { Context } from 'koa'
import cors from '@koa/cors'
import jwt from 'koa-jwt'
import { Server } from 'socket.io'
import { MikroORM } from '@mikro-orm/core'

import { buildSchema } from 'type-graphql'

import { ENVIRONMENT, HOST, PORT, PRIVATE_KEY } from './dependencies/config'

import { FriendRequestResolver } from './lib/resolvers/FriendRequestResolver'
import { GroupResolver } from './lib/resolvers/GroupResolver'
import { UserResolver } from './lib/resolvers/UserResolver'
import { GroupInviteResolver } from './lib/resolvers/GroupInviteResolver'

import { CustomContext } from './types/interfaces/CustomContext'
import { isLogged } from './middlewares/guards/IsLogged'
import { authAndSettStateUser } from './middlewares/SetStateUser'
import { ErrorInterceptor } from './middlewares/ErrorInterceptor'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import { AuthResolver } from './lib/resolvers/AuthResolver'
import { initSocketEvents } from './lib/socket/SocketInitEvents'
import { TextChannelResolver } from './lib/resolvers/TextChannelResolver'
import { VoiceChannelResolver } from './lib/resolvers/VoiceChannelResolver'

async function main (): Promise<void> {
  console.log(`ENVIRONMENT: ${ENVIRONMENT}`)
  console.log('=== SETUP DATABASE ===')
  const connection = await MikroORM.init()

  console.log('=== BUILDING GQL SCHEMA ===')
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      FriendRequestResolver,
      GroupResolver,
      GroupInviteResolver,
      AuthResolver,
      TextChannelResolver,
      VoiceChannelResolver
    ],
    globalMiddlewares: [isLogged, ErrorInterceptor]
  })
  const app = new Koa()
  const httpServer = createServer(app.callback())

  const io = new Server(httpServer, {
    allowEIO3: true,
    pingInterval: 25000,
    pingTimeout: 60000

  })

  await initSocketEvents(io, connection.em.fork())

  const apolloServer = new ApolloServer({
    schema,
    context ({ ctx }: { ctx: Context }): CustomContext {
      return {
        ctx,
        request: undefined,
        state: ctx.state,
        em: connection.em.fork(),
        dataLoader: true,
        io: io
      }
    },
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer })
    ]
  })

  if (ENVIRONMENT === 'production') {
    app.proxy = true
  }

  await apolloServer.start()

  app.use(cors())

  app.use(jwt({ secret: PRIVATE_KEY, passthrough: true }))

  app.use(authAndSettStateUser(connection.em.fork()))

  app.use(apolloServer.getMiddleware({ cors: app.proxy }))

  httpServer.listen({ port: PORT }, () => {
    console.log(`http://${HOST}:${PORT}/graphql`)
  })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
