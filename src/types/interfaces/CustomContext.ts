import { Context } from 'koa'
import { EntityManager } from '@mikro-orm/core'

import { User } from '../entities/User'
import { Server } from 'socket.io'

export interface CustomContext {
  ctx: Context

  em: EntityManager

  request?: Request & { authFree: boolean }

  state: {
    user?: User
  }

  user?: User

  dataLoader: boolean

  io: Server
}

export interface AuthCustomContext extends CustomContext {
  user: User
}
