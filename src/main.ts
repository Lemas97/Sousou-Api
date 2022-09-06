import 'reflect-metadata'

import { createServer } from 'http'
import { ApolloServer } from 'apollo-server-koa'
import Koa, { Context } from 'koa'
import cors from '@koa/cors'
import jwt from 'koa-jwt'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'

import { MikroORM } from '@mikro-orm/core'

import { buildSchema } from 'type-graphql'

import { ENVIRONMENT, HOST, PORT, PRIVATE_KEY } from 'src/dependencies/config'

import { FriendRequestResolver } from './lib/resolvers/FriendRequestResolver'
import { GroupResolver } from './lib/resolvers/GroupResolver'
import { UserResolver } from './lib/resolvers/UserResolver'
import { GroupInviteResolver } from './lib/resolvers/GroupInviteResolver'

import { CustomContext } from './types/interfaces/CustomContext'
import { isLogged } from './middlewares/guards/IsLogged'
import { authAndSettStateUser } from './middlewares/SetStateUser'
import { ErrorInterceptor } from './middlewares/ErrorInterceptor'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import { User } from './types/entities/User'
import { AuthResolver } from './lib/resolvers/AuthResolver'

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
      AuthResolver
    ],
    globalMiddlewares: [isLogged, ErrorInterceptor]
  })
  const app = new Koa()
  const httpServer = createServer(app.callback())

  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // verifyClient: (_info, _done) => {
    // },
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql'
  })

  wsServer.on('connection', (_ws, _request) => {
    // console.log(request.url?.split('param=')[1])
  })

  const serverCleanup = useServer(
    {
      schema,
      context: (_ctx, _msg, _args) => {
        return {
          dataLoader: true,
          state: {
            user: new User()
          }
        }
      // Returning an object will add that information to our
      // GraphQL context, which all of our resolvers have access to.
      // return getDynamicContext(ctx, msg, args)
      }
    },
    wsServer
  )

  const apolloServer = new ApolloServer({
    schema,
    csrfPrevention: true,
    context ({ ctx }: { ctx: Context }): CustomContext {
      return {
        ctx,
        request: undefined,
        state: ctx.state,
        em: connection.em.fork(),
        dataLoader: true
      }
    },
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart () {
          return {
            async drainServer () {
              await serverCleanup.dispose()
            }
          }
        }
      }
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
