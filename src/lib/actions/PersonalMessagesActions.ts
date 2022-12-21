import { EntityManager } from '@mikro-orm/core'
import { PaginatedInputData } from '../../types/classes/input-data/PaginatedInputData'
import { PaginatedPersonalMessages } from '../../types/classes/pagination/MessagesPaginated'
import { PersonalChat } from '../../types/entities/PersonalChat'
import { PersonalMessage } from '../../types/entities/PersonalMessage'
import { User } from '../../types/entities/User'

export async function getPersonalMessagesActionByPersonalChatIdAction (personalChatId: string, paginationData: PaginatedInputData, currentUser: User, em: EntityManager): Promise<PaginatedPersonalMessages> {
  if (!paginationData.filter) paginationData.filter = ''
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit

  await em.findOneOrFail(PersonalChat, {
    id: personalChatId,
    pivot: {
      users: currentUser
    }
  })

  const [messages, count] = await em.findAndCount(PersonalMessage, {
    personalChat: personalChatId
  }, {
    limit: paginationData.limit > 0 ? paginationData.limit : undefined,
    offset,
    orderBy: { createdAt: 'DESC' }
  })

  return { data: messages, total: count }
}
