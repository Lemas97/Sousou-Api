import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import { PaginatedInputData } from '../../types/classes/input-data/PaginatedInputData'
import { TextChannelInputData } from '../../types/classes/input-data/TextChannelInputData'
import { Group } from '../../types/entities/Group'
import { TextChannel } from '../../types/entities/TextChannel'
import { TextChannelMessage } from '../../types/entities/TextChannelMessage'
import { TextChannelUserPivot } from '../../types/entities/TextChannelUserPivot'
import { User } from '../../types/entities/User'

export async function getTextChannelByIdAction (id: string, currentUser: User, em: EntityManager): Promise<TextChannel> {
  const textChannel = await em.findOneOrFail(TextChannel, id, {
    populate: [
      'group.members'
    ]
  })
  if (!textChannel.group.members.getItems().map(me => me.id).includes(currentUser.id)) throw new ForbiddenError('You have no access on this voice channel')

  return textChannel
}

export async function getPersonalMessagesActionByPersonalChatIdAction (textChannelId: string, paginationData: PaginatedInputData, currentUser: User, em: EntityManager): Promise<TextChannel> {
  if (!paginationData.filter) paginationData.filter = ''
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit

  const textChannel = await em.findOneOrFail(TextChannel, {
    id: textChannelId,
    users: currentUser.id
  }, {
    populate: ['users']
  })

  const lastReadPivot = await em.findOneOrFail(TextChannelUserPivot, {
    user: currentUser.id,
    textChannel
  })

  const [messages] = await em.findAndCount(TextChannelMessage, {
    textChannel: textChannelId
  }, {
    limit: paginationData.limit > 0 ? paginationData.limit : undefined,
    offset,
    orderBy: { createdAt: 'DESC' }
  })

  textChannel.messages.set(messages)
  textChannel.lastReadMessages = lastReadPivot
  em.clear()
  return textChannel
}

export async function createTextChannelAction (data: TextChannelInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const group = await em.findOneOrFail(Group, data.groupId)

  if (group.owner.id !== currentUser.id) {
    throw new ForbiddenError('NO_ACCESS')
  }

  const textChannel = em.create(TextChannel, {
    ...data,
    group: group.id,
    users: group.members.getItems().map(member => member)
  })

  await em.persistAndFlush(textChannel)

  return true
}

export async function updateTextChannelAction (id: string, data: TextChannelInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const textChannel = await em.findOneOrFail(TextChannel, id, { populate: ['group.owner'] })

  if (data.groupId !== textChannel.group.id) throw new UserInputError('Cannot move text channels to another group')

  if (textChannel.group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  em.assign(textChannel, {
    ...data
  })

  await em.flush()

  return true
}

export async function deleteTextChannelAction (id: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const textChannel = await em.findOneOrFail(TextChannel, id, { populate: ['group.owner'] })

  if (textChannel.group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  await em.removeAndFlush(textChannel)

  return true
}
