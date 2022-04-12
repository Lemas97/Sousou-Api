import { ForbiddenError } from 'apollo-server-koa'
import { CustomContext } from 'src/types/interfaces/CustomContext'
import { MiddlewareFn } from 'type-graphql'

export const isLogged: MiddlewareFn<CustomContext> = async (ctx, next) => {
  if (!ctx.context.dataLoader) {
    return await next()
  }

  if (ctx.info.fieldName === 'loginUser' || ctx.info.fieldName === 'registerUser' || ctx.info.fieldName === 'resendEmailConfirmation') {
    return await next()
  }

  if (ctx.context.state.user === undefined) {
    throw new ForbiddenError('Not authorized!')
  }

  ctx.context.dataLoader = false
  return await next()
}
