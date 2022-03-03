import { Context } from 'koa'
import { EntityManager } from '@mikro-orm/core'

import { AuthUser } from 'src/types/interfaces/AuthUser'
import { User } from 'src/types/entities/User'

export interface CustomContext {
  ctx: Context

  em: EntityManager

  state: {
    user?: AuthUser
  }

  user?: User
}

export interface AuthCustomContext extends CustomContext {
  user: User
}
