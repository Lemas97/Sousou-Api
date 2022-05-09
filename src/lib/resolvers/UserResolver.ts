import { EntityManager } from '@mikro-orm/core'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { PaginatedUsers } from 'src/types/classes/pagination/PaginatedUsers'
import { confirmEmailAction, connectToVoiceChannelAction, disconnectFromVoiceChatAction, getLoggedUserAction, getUsersAction, kickFromVoiceChannelAction, loginUserAction, logoutUserAction, registerUserAction, resendEmailConfirmationAction, updateUserPreferencesAction } from '../actions/UserAction'
import { UserPreferencesInputData } from 'src/types/classes/input-data/json-input-data/UserPreferencesInputData'
import { User } from 'src/types/entities/User'
import { UserRegisterInputData } from 'src/types/classes/input-data/UserRegisterInputData'
import { LoginUserInputData } from 'src/types/classes/input-data/LoginUserInputData'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'

@Resolver() // test
export class UserResolver {
  @Query(() => PaginatedUsers)
  async getUsers (
    @Ctx('em') em: EntityManager,
      @Arg('paginatedData') paginatedData: PaginatedInputData
  ): Promise<PaginatedUsers> {
    return await getUsersAction(paginatedData, em)
  }

  @Query(() => User)
  async getLoggedUser (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User
  ): Promise<User> {
    return await getLoggedUserAction(currentUser, em)
  }

  @Mutation(() => Boolean)
  async registerUser (
    @Ctx('em') em: EntityManager,
      @Arg('data') data: UserRegisterInputData
  ): Promise<boolean> {
    return await registerUserAction(data, em)
  }

  @Mutation(() => String)
  async loginUser (
    @Ctx('em') em: EntityManager,
      @Arg('data') data: LoginUserInputData
  ): Promise<string> {
    return await loginUserAction(data, em)
  }

  @Mutation(() => Boolean)
  async logoutUser (
    @Ctx('em') em: EntityManager
  ): Promise<boolean> {
    return await logoutUserAction(em)
  }

  @Mutation(() => User)
  async updateUserPreferences (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('data') data: UserPreferencesInputData
  ): Promise<User> {
    return await updateUserPreferencesAction(data, currentUser, em)
  }

  @Mutation(() => Boolean)
  async connectToVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('voiceChannelId') voiceChannelId: string
  ): Promise<boolean> {
    return await connectToVoiceChannelAction(voiceChannelId, currentUser, em)
  }

  @Mutation(() => Boolean)
  async disconnectFromVoiceChat (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext
  ): Promise<boolean> {
    return await disconnectFromVoiceChatAction(ctx.user, em)
  }

  @Mutation(() => Boolean)
  async kickFromVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('id') id: string,
      @Arg('voiceChannelId') voiceChannelId: string
  ): Promise<boolean> {
    return await kickFromVoiceChannelAction(id, voiceChannelId, currentUser, em)
  }

  @Mutation(() => Boolean)
  async confirmEmail (
    @Ctx('em') em: EntityManager,
      @Arg('confirmEmailToken') confirmEmailToken: string
  ): Promise<boolean> {
    return await confirmEmailAction(confirmEmailToken, em)
  }

  @Mutation(() => Boolean)
  async resendEmailConfirmation (
    @Ctx('em') em: EntityManager,
      @Arg('email') email: string
  ): Promise<boolean> {
    return await resendEmailConfirmationAction(email, em)
  }
}
