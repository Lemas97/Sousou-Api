import { ForbiddenError } from 'apollo-server-koa'
import { CustomContext } from 'src/types/interfaces/CustomContext'
import { MiddlewareFn } from 'type-graphql'

export const isLogged: MiddlewareFn<CustomContext> = async (ctx, next) => {
  if (!ctx.context) {
    return await next()
  }
  if (!ctx.context.dataLoader) {
    return await next()
  }
  console.log(ctx.info.fieldName)
  console.log(ctx.context.state.user)
  if (
    ctx.info.fieldName === 'loginUser' ||
    ctx.info.fieldName === 'registerUser' ||
    ctx.info.fieldName === 'resendEmailConfirmation' ||
    ctx.info.fieldName === 'confirmEmail'
  ) {
    return await next()
  }

  if (ctx.context.state.user === undefined) {
    throw new ForbiddenError('Not authorized!')
  }
  ctx.context.user = ctx.context.state.user

  console.log(ctx.context.user)
  ctx.context.dataLoader = false
  return await next()
}
