import { EntityManager } from '@mikro-orm/core'
import { Next } from 'koa'
import { CustomContext } from 'src/types/interfaces/CustomContext'

import { User } from 'src/types/entities/User'
export function setStateUser (em: EntityManager): (ctx: CustomContext, next: Next) => Promise<void> {
  return async (ctx: CustomContext, next: Next) => {
    if (!ctx.request?.url.includes('authFree')) {
      if (ctx.state.user !== undefined) {
        const userData: any = ctx.state.user

        const logged = await em.findOne(User, userData.id)

        const user = logged

        ctx.user = user as User
      }
    }
    await next()
  }
}
