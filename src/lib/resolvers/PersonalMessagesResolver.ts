import { EntityManager } from '@mikro-orm/mariadb'
import { Arg, Ctx, Query, Resolver } from 'type-graphql'
import { PaginatedInputData } from '../../types/classes/input-data/PaginatedInputData'
import { PaginatedPersonalMessages } from '../../types/classes/pagination/MessagesPaginated'
import { AuthCustomContext } from '../../types/interfaces/CustomContext'
import { getPersonalMessagesActionByPersonalChatIdAction } from '../actions/PersonalMessagesActions'

@Resolver()
export class PersonalMessagesResolver {
  @Query(() => PaginatedPersonalMessages)
  async getPersonalMessagesActionByPersonalChatId (
    @Ctx('em') em: EntityManager,
      @Ctx('ctx') ctx: AuthCustomContext,
      @Arg('personalChatId') personalChatId: string,
      @Arg('paginationInputData') paginationInputData: PaginatedInputData
  ): Promise<PaginatedPersonalMessages> {
    return await getPersonalMessagesActionByPersonalChatIdAction(personalChatId, paginationInputData, ctx.user, em)
  }
}
