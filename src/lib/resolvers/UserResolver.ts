/* eslint-disable no-template-curly-in-string */
import { EntityManager } from '@mikro-orm/core'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { PaginatedUsers } from 'src/types/classes/pagination/PaginatedUsers'
import {
  connectToVoiceChannelAction,
  deleteFriendAction,
  disconnectFromVoiceChatAction,
  getAvailableUsersToAddAction,
  getAvailableUsersToInviteAction,
  getFriendRequestsAction,
  getLoggedUserAction,
  getUsersAction,
  kickFromVoiceChannelAction,
  logoutUserAction,
  updateUserAction,
  updateUserEmailAction,
  updateUserPasswordAction,
  updateUserPreferencesAction
} from '../actions/UserActions'
import { UserPreferencesInputData } from 'src/types/classes/input-data/json-input-data/UserPreferencesInputData'
import { User } from 'src/types/entities/User'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { PaginatedFriendRequests } from 'src/types/classes/pagination/PaginatedFriendRequests'
import { UpdateUserInputData } from 'src/types/classes/input-data/UpdateUserInputData'

@Resolver()
export class UserResolver {
  @Query(() => PaginatedUsers)
  async getUsers (
    @Ctx('em') em: EntityManager,
      @Arg('paginatedData') paginatedData: PaginatedInputData
  ): Promise<PaginatedUsers> {
    return await getUsersAction(paginatedData, em)
  }

  @Query(() => PaginatedUsers)
  async getAvailableUsersToAdd (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('paginatedData') paginatedData: PaginatedInputData
  ): Promise<PaginatedUsers> {
    return await getAvailableUsersToAddAction(paginatedData, ctx.user, em)
  }

  @Query(() => PaginatedUsers)
  async getAvailableUsersToInvite (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('paginatedData') paginatedData: PaginatedInputData,
      @Arg('groupId') groupId: string
  ): Promise<PaginatedUsers> {
    return await getAvailableUsersToInviteAction(paginatedData, groupId, ctx.user, em)
  }

  @Query(() => User)
  async getLoggedUser (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext
  ): Promise<User> {
    return await getLoggedUserAction(ctx.user, em)
  }

  // make getFriendRequests query
  @Query(() => PaginatedFriendRequests)
  async getFriendRequests (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('paginatedData') paginatedData: PaginatedInputData,
      @Arg('forMe') forMe: boolean
  ): Promise<PaginatedFriendRequests> {
    return await getFriendRequestsAction(paginatedData, forMe, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async logoutUser (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext
  ): Promise<boolean> {
    return await logoutUserAction(ctx.user, em)
  }

  @Mutation(() => Boolean)
  async updateUser (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: UpdateUserInputData
  ): Promise<boolean> {
    return await updateUserAction(data, ctx.user, em)
  }

  @Mutation(() => Boolean, { description: 'Sending an email to user with this link ${FRONT_URL}:${FRONT_PORT}/change-email/${changeEmailToken}' })
  async updateUserEmail (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('newEmail') newEmail: string
  ): Promise<boolean> {
    return await updateUserEmailAction(newEmail, ctx.user, em)
  }

  @Mutation(() => Boolean, { description: 'Sending an email to user with this link ${FRONT_URL}:${FRONT_PORT}/change-email/${changeEmailToken}' })
  async updateUserPassword (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('newEmail') newEmail: string
  ): Promise<boolean> {
    return await updateUserPasswordAction(newEmail, ctx.user, em)
  }

  @Mutation(() => User)
  async updateUserPreferences (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: UserPreferencesInputData
  ): Promise<User> {
    return await updateUserPreferencesAction(data, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async connectToVoiceChannel (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('voiceChannelId') voiceChannelId: string
  ): Promise<boolean> {
    return await connectToVoiceChannelAction(voiceChannelId, ctx.user, em)
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
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('voiceChannelId') voiceChannelId: string
  ): Promise<boolean> {
    return await kickFromVoiceChannelAction(id, voiceChannelId, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async deleteFriend (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await deleteFriendAction(id, ctx.user, em)
  }
}
