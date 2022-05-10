import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError } from 'apollo-server-koa'
import { VoiceChannelInputData } from 'src/types/classes/input-data/VoiceChannelInputData'
import { Group } from 'src/types/entities/Group'
import { User } from 'src/types/entities/User'
import { VoiceChannel } from 'src/types/entities/VoiceChannel'

export async function createVoiceChannelAction (data: VoiceChannelInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const group = await em.findOneOrFail(Group, data.groupId)

  if (group.owner !== currentUser) {
    throw new ForbiddenError('NO_ACCESS')
  }

  const voiceChannel = em.create(VoiceChannel, {
    group: data.groupId,
    ...data
  })

  await em.persistAndFlush(voiceChannel)

  return true
}

export async function updateVoiceChannelAction (id: string, data: VoiceChannelInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, id, { populate: ['group'] })

  if (voiceChannel.group.owner !== currentUser) {
    throw new ForbiddenError('NO_ACCESS')
  }

  em.assign(voiceChannel, { ...data })
  await em.flush()

  return true
}

export async function deleteVoiceChannelAction (id: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, id, { populate: ['group'] })

  if (voiceChannel.group.owner !== currentUser) {
    throw new ForbiddenError('NO_ACCESS')
  }

  await em.removeAndFlush(voiceChannel)

  return true
}

export async function connectToVoiceChannelAction (id: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, id, { populate: ['group'] })

  if (!voiceChannel.group.members.contains(currentUser)) {
    throw new ForbiddenError('NO_ACCESS')
  }

  voiceChannel.users.add(currentUser)

  await em.flush()

  return true
}

export async function disconnectFromVoiceChannelAction (id: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, id, { populate: ['group'] })

  // if (!voiceChannel.group.members.contains(currentUser)) {
  //   throw new ForbiddenError('NO_ACCESS')
  // }

  voiceChannel.users.remove(currentUser)

  await em.flush()

  return true
}
