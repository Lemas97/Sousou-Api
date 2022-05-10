import { EntityManager } from '@mikro-orm/core'
import { GroupInputData } from 'src/types/classes/input-data/GroupInputData'
import { GroupPreferencesInputData } from 'src/types/classes/input-data/json-input-data/GroupPreferencesInputData'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { PaginatedGroups } from 'src/types/classes/pagination/PaginatedGroups'
import { AuthCustomContext } from 'src/types/interfaces/CustomContext'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
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

  @Mutation(() => Boolean)
  async createGroup (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('data') data: GroupInputData
  ): Promise<boolean> {
    return await createGroupAction(data, ctx.user, em)
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
}
