import { ForbiddenError } from 'apollo-server-koa'
import { CustomContext } from '../../types/interfaces/CustomContext'
import { MiddlewareFn } from 'type-graphql'

export const isLogged: MiddlewareFn<CustomContext> = async (ctx, next) => {
  if (!ctx.context) {
    return await next()
  }
  if (!ctx.context.dataLoader) {
    return await next()
  }

  if ([
    'loginUser',
    'registerUser',
    'resendEmailConfirmation',
    'confirmEmail',
    'refreshToken',
    'confirmChangeEmail',
    'forgotPassword',
    'resetPassword'
  ].includes(ctx.info.fieldName)
  ) {
    return await next()
  }

  if (ctx.context.state.user === undefined) {
    throw new ForbiddenError('Not authorized!')
  }
  ctx.context.dataLoader = false
  return await next()
}
