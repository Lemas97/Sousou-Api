import { ForbiddenError, UserInputError, ValidationError } from 'apollo-server-errors'
import { MiddlewareFn } from 'type-graphql'
import { NotFoundError } from '@mikro-orm/core'

import * as Sentry from '@sentry/node'

import { CustomContext } from 'src/types/interfaces/CustomContext'

export const ErrorInterceptor: MiddlewareFn<CustomContext> = async (_ctx, next) => {
  try {
    return await next()
  } catch (err) {
    console.log(err)
    Sentry.captureException(err.message)
    if (err.extensions?.code && err.extensions.code === 'BAD_USER_INPUT') {
      throw new UserInputError(err.message)
    }
    if (err.extensions?.code && err.extensions.code === 'GRAPHQL_VALIDATION_FAILED') {
      throw new ValidationError(err.message)
    }
    if (err.extensions?.code && err.extensions.code === 'FORBIDDEN') {
      throw new ForbiddenError(err.message)
    }
    if (err.entity || err.entity === undefined) {
      throw new NotFoundError(err.message)
    }
    if (err.message === 'Argument Validation Error') {
      let errorMessage = ''
      err.validationErrors.forEach((error: ValidationError, index: number) => {
        if (error.constraints) {
          errorMessage += (Object.values(error.constraints)).toString()
          if (index < error.length) {
            errorMessage += ', '
          }
        }
      })
      throw new UserInputError(errorMessage)
    }
  }
}
