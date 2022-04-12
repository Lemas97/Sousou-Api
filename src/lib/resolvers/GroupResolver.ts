import { EntityManager } from '@mikro-orm/core'
import { GroupInputData } from 'src/types/classes/input-data/GroupInputData'
import { GroupPreferencesInputData } from 'src/types/classes/input-data/json-input-data/GroupPreferencesInputData'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { PaginatedGroups } from 'src/types/classes/pagination/PaginatedGroups'
import { User } from 'src/types/entities/User'
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
      @Ctx('user') currentUser: User,
      @Arg('data') data: GroupInputData
  ): Promise<boolean> {
    return await createGroupAction(data, currentUser, em)
  }

  @Mutation(() => Boolean)
  async updateGroup (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('id') id: string,
      @Arg('data') data: GroupInputData
  ): Promise<boolean> {
    return await updateGroupAction(id, data, currentUser, em)
  }

  @Mutation(() => Boolean)
  async deleteGroup (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('id') id: string
  ): Promise<boolean> {
    return await deleteGroupAction(id, currentUser, em)
  }

  @Mutation(() => Boolean)
  async updateGroupPreferences (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('id') id: string,
      @Arg('data') data: GroupPreferencesInputData
  ): Promise<boolean> {
    return await updateGroupPreferencesAction(id, data, currentUser, em)
  }

  @Mutation(() => Boolean)
  async transferOwnershipToUser (
    @Ctx('em') em: EntityManager,
      @Ctx('user') currentUser: User,
      @Arg('id') id: string,
      @Arg('newOwnerId') newOwnerId: string
  ): Promise<boolean> {
    return await transferOwnershipToUserAction(id, newOwnerId, currentUser, em)
  }
}
