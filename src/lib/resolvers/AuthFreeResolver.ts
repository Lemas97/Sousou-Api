/* eslint-disable no-template-curly-in-string */
import { EntityManager } from '@mikro-orm/core'
import { LoginUserInputData } from '../../types/classes/input-data/LoginUserInputData'
import { UserRegisterInputData } from '../../types/classes/input-data/UserRegisterInputData'
import { AuthCustomContext } from '../../types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { confirmEmailAction, loginUserAction, resendEmailConfirmationAction, refreshTokenAction, registerUserAction, confirmChangeEmailAction, usernameExistsAction, forgotPasswordAction, resetPasswordAction } from '../actions/AuthFreeActions'

@Resolver()
export class AuthFreeResolver {
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

  @Mutation(() => String)
  async forgotPassword (
    @Ctx('em') em: EntityManager,
      @Arg('email') email: string
  ): Promise<string> {
    return await forgotPasswordAction(email, em)
  }

  @Mutation(() => Boolean)
  async confirmEmail (
    @Ctx('em') em: EntityManager,
      @Arg('confirmEmailToken') confirmEmailToken: string
  ): Promise<boolean> {
    return await confirmEmailAction(confirmEmailToken, em)
  }

  @Mutation(() => Boolean)
  async resetPassword (
    @Ctx('em') em: EntityManager,
      @Arg('resetPasswordToken') resetPasswordToken: string,
      @Arg('newPassword') newPassword: string
  ): Promise<boolean> {
    return await resetPasswordAction(resetPasswordToken, newPassword, em)
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
