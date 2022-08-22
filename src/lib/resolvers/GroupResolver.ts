import { EntityManager } from '@mikro-orm/core'
import { GroupInputData } from 'src/types/classes/input-data/GroupInputData'
import { GroupPreferencesInputData } from 'src/types/classes/input-data/json-input-data/GroupPreferencesInputData'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { PaginatedGroups } from 'src/types/classes/pagination/PaginatedGroups'
import { GroupSubscription } from 'src/types/classes/subscriptions/GroupSubscription'
import { Group } from 'src/types/entities/Group'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Publisher, PubSub, Query, Resolver, Root, Subscription } from 'type-graphql'
import {
  createGroupAction,
  deleteGroupAction,
  getGroupByIdAction,
  getGroupsAction,
  transferOwnershipToUserAction,
  updateGroupAction,
  updateGroupPreferencesAction
} from '../actions/GroupActions'

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
      @Arg('id') id: string,
      @Arg('data') data: GroupInputData
  ): Promise<boolean> {
    const group = await updateGroupAction(id, data, ctx.user, em)
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

  @Subscription(() => GroupSubscription, {
    topics: ['GROUP_CREATED', 'GROUP_UPDATED', 'GROUP_DELETED'],
    filter: ({ payload, args }) => args.userId === payload.owner.id || (payload as Group).members.getItems().map(member => member.id).includes(args.userId)
  })
  onGroupActions (@Root() payload: Group, @Arg('userId') _: string): GroupSubscription {
    return { group: payload, event: 'delete' }
  }
}
