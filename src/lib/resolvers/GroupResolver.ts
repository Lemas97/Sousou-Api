import { EntityManager } from '@mikro-orm/core'
import { GroupInputData } from '../../types/classes/input-data/GroupInputData'
import { GroupPreferencesInputData } from '../../types/classes/input-data/json-input-data/GroupPreferencesInputData'
import { PaginatedInputData } from '../../types/classes/input-data/PaginatedInputData'
import { PaginatedGroups } from '../../types/classes/pagination/PaginatedGroups'
import { Group } from '../../types/entities/Group'
import { AuthCustomContext } from '../../types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Publisher, PubSub, Query, Resolver } from 'type-graphql'
import {
  createGroupAction,
  deleteGroupAction,
  getGroupByIdAction,
  getGroupsAction,
  transferOwnershipToUserAction,
  updateGroupAction,
  updateGroupPreferencesAction
} from '../actions/GroupActions'
import { Server } from 'socket.io'

@Resolver()
export class GroupResolver {
  @Query(() => PaginatedGroups)
  async getGroups (
    @Ctx('em') em: EntityManager,
      @Arg('paginationInputData') paginationInputData: PaginatedInputData
  ): Promise<PaginatedGroups> {
    return await getGroupsAction(paginationInputData, em)
  }

  @Query(() => Group)
  async getGroupById (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<Group> {
    return await getGroupByIdAction(id, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async createGroup (
    @PubSub('GROUP_CREATED') publish: Publisher<Group>,
      @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: GroupInputData
  ): Promise<boolean> {
    const group = await createGroupAction(data, ctx.user, em)
    await publish(group)
    return true
  }

  @Mutation(() => Boolean)
  async updateGroup (
    @PubSub('GROUP_UPDATED') publish: Publisher<Group>,
      @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Ctx('io') io: Server,
      @Arg('id') id: string,
      @Arg('data') data: GroupInputData
  ): Promise<boolean> {
    const group = await updateGroupAction(id, data, ctx.user, io, em)
    await publish(group)
    return true
  }

  @Mutation(() => Boolean)
  async deleteGroup (
    @PubSub('GROUP_DELETED') _publish: Publisher<Group>,
      @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await deleteGroupAction(id, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async updateGroupPreferences (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('data') data: GroupPreferencesInputData
  ): Promise<boolean> {
    return await updateGroupPreferencesAction(id, data, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async transferOwnershipToUser (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('newOwnerId') newOwnerId: string
  ): Promise<boolean> {
    return await transferOwnershipToUserAction(id, newOwnerId, ctx.user, em)
  }
}
