import { EntityManager } from '@mikro-orm/core'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { PaginatedGroups } from 'src/types/classes/pagination/PaginatedGroups'
import { Arg, Ctx, Query, Resolver } from 'type-graphql'
import { getGroupsAction } from '../actions/GroupAction'

@Resolver()
export class GroupResolver {
  @Query(() => PaginatedGroups)
  async getGroups (
    @Ctx('em') em: EntityManager,
      @Arg('paginationInputData') paginationInputData: PaginatedInputData
  ): Promise<PaginatedGroups> {
    return await getGroupsAction(paginationInputData, em)
  }
}
