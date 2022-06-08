import { EntityManager } from '@mikro-orm/core'
import { GroupInputData } from 'src/types/classes/input-data/GroupInputData'
import { GroupPreferencesInputData } from 'src/types/classes/input-data/json-input-data/GroupPreferencesInputData'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { PaginatedGroups } from 'src/types/classes/pagination/PaginatedGroups'
import { Group } from 'src/types/entities/Group'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Publisher, PubSub, Query, Resolver, Root, Subscription } from 'type-graphql'
import {
  createGroupAction,
  deleteGroupAction,
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

  @Mutation(() => Group)
  async createGroup (
    @Ctx('em') em: EntityManager,
      @PubSub('GROUP_CREATED') publish: Publisher<Group>,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: GroupInputData
  ): Promise<Group> {
    const group = await em.find(Group, {})
    console.log('edw')
    await publish(group[0])
    console.log('edw')
    await createGroupAction(data, ctx.user, em)
    return group[0]
  }

  @Mutation(() => Boolean)
  async updateGroup (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('id') id: string,
      @Arg('data') data: GroupInputData
  ): Promise<boolean> {
    return await updateGroupAction(id, data, ctx.user, em)
  }

  @Mutation(() => Boolean)
  async deleteGroup (
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

  @Subscription(() => Group, {
    topics: 'GROUP_CREATED'
    // filter: ({ payload, args }) => args.store_slug === payload.store_slug
  })
  onCreateGroup (@Root() payload: Group, @Arg('store_slug') _: string): Group {
    return payload
  }
}
