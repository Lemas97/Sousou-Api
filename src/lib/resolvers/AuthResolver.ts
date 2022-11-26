/* eslint-disable no-template-curly-in-string */
import { EntityManager } from '@mikro-orm/core'
import { LoginUserInputData } from 'src/types/classes/input-data/LoginUserInputData'
import { UserRegisterInputData } from 'src/types/classes/input-data/UserRegisterInputData'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { confirmEmailAction, loginUserAction, resendEmailConfirmationAction, refreshTokenAction, registerUserAction, confirmChangeEmailAction, usernameExistsAction } from '../actions/AuthFreeActions'

@Resolver()
export class AuthResolver {
  @Query(() => Boolean)
  async usernameExists (
    @Ctx('em') em: EntityManager,
      @Arg('username') username: string
  ): Promise<boolean> {
    return await usernameExistsAction(username, em)
  }

  // @Mutation(() => Boolean)
  @Mutation(() => String)
  async registerUser (
    @Ctx('em') em: EntityManager,
      @Arg('data') data: UserRegisterInputData
  ): Promise<string> {
    return await registerUserAction(data, em)
  }

  @Mutation(() => String, { description: 'Set connected' })
  async loginUser (
    @Ctx('em') em: EntityManager,
      @Arg('data') data: LoginUserInputData
  ): Promise<string> {
    return await loginUserAction(data, em)
  }

  @Mutation(() => String)
  async resendEmailConfirmation (
    @Ctx('em') em: EntityManager,
      @Arg('email') email: string
  ): Promise<string> {
    return await resendEmailConfirmationAction(email, em)
  }

  @Mutation(() => Boolean)
  async confirmEmail (
    @Ctx('em') em: EntityManager,
      @Arg('confirmEmailToken') confirmEmailToken: string
  ): Promise<boolean> {
    return await confirmEmailAction(confirmEmailToken, em)
  }

  @Mutation(() => String)
  async refreshToken (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext
  ): Promise<string> {
    return await refreshTokenAction(ctx.user, em)
  }

  @Mutation(() => Boolean, { description: 'Send the `changeEmailToken` you get by email' })
  async confirmChangeEmail (
    @Ctx('em') em: EntityManager,
      @Arg('changeEmailToken') changeEmailToken: string
  ): Promise<boolean> {
    return await confirmChangeEmailAction(changeEmailToken, em)
  }
}
