import { ForbiddenError } from 'apollo-server-koa'
import { CustomContext } from 'src/types/interfaces/CustomContext'
import { MiddlewareFn } from 'type-graphql'

export const isLogged: MiddlewareFn<CustomContext> = async (ctx, next) => {
  if (ctx.info.path.key === 'loginUser' || ctx.info.path.key === 'registerUser' || (ctx.info.path.prev && (ctx.info.path?.prev.key === 'loginUser' || ctx.info.path.prev.key === 'registerUser'))) {
    return await next()
  }

  if (ctx.context.state.user === undefined) {
    throw new ForbiddenError('Not authorized!')
  }
  return await next()
}
