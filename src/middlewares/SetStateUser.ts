import { EntityManager } from '@mikro-orm/core'
import { Next } from 'koa'
import { CustomContext } from '../types/interfaces/CustomContext'

import { User } from '../types/entities/User'
export function authAndSettStateUser (em: EntityManager): (ctx: CustomContext, next: Next) => Promise<void> {
  return async (ctx: CustomContext, next: Next) => {
    ctx.em.clear()
    if (ctx.state.user !== undefined) {
      const userData: any = ctx.state.user

      const logged = await em.findOne(User, userData.id)

      const user = logged

      ctx.user = user as User
    }
    await next()
  }
}
