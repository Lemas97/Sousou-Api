import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import { TextChannelInputData } from 'src/types/classes/input-data/TextChannelInputData'
import { Group } from 'src/types/entities/Group'
import { TextChannel } from 'src/types/entities/TextChannel'
import { User } from 'src/types/entities/User'

export async function createTextChannelAction (data: TextChannelInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const group = await em.findOneOrFail(Group, data.groupId)

  if (group.owner !== currentUser) {
    throw new ForbiddenError('NO_ACCESS')
  }

  const voiceChannel = em.create(TextChannel, {
    group: group.id,
    ...data
  })

  await em.persistAndFlush(voiceChannel)

  return true
}

export async function updateTextChannelAction (id: string, data: TextChannelInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const textChannel = await em.findOneOrFail(TextChannel, id, { populate: ['group.owner'] })

  if (data.groupId !== textChannel.group.id) throw new UserInputError('Cannot move text channels to another group')

  if (textChannel.group.owner !== currentUser) throw new ForbiddenError('NO_ACCESS')

  em.assign(textChannel, {
    ...data
  })

  await em.flush()

  return true
}

export async function deleteTextChannelAction (id: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const textChannel = await em.findOneOrFail(TextChannel, id, { populate: ['group.owner'] })

  if (textChannel.group.owner !== currentUser) throw new ForbiddenError('NO_ACCESS')

  await em.removeAndFlush(textChannel)

  return true
}
