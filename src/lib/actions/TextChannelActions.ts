import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import { TextChannelInputData } from '../..//types/classes/input-data/TextChannelInputData'
import { Group } from '../..//types/entities/Group'
import { TextChannel } from '../..//types/entities/TextChannel'
import { User } from '../..//types/entities/User'

export async function createTextChannelAction (data: TextChannelInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const group = await em.findOneOrFail(Group, data.groupId)

  if (group.owner.id !== currentUser.id) {
    throw new ForbiddenError('NO_ACCESS')
  }

  const textChannel = em.create(TextChannel, {
    group: group.id,
    ...data
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
