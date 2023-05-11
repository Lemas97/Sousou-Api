import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import { Server } from 'socket.io'

import { VoiceChannelInputData } from '../../types/classes/input-data/VoiceChannelInputData'
import { Group } from '../../types/entities/Group'
import { User } from '../../types/entities/User'
import { VoiceChannel } from '../../types/entities/VoiceChannel'
import { connectedUserInVoiceChannel, disconnectUserFromVoiceChannel, kickFromVoiceChannel } from '../socket/SocketInitEvents'

export async function getVoiceChannelByIdAction (id: string, currentUser: User, em: EntityManager): Promise<VoiceChannel> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, id, {
    populate: [
      'group.members'
    ]
  })
  if (!voiceChannel.group.members.getItems().map(me => me.id).includes(currentUser.id)) throw new ForbiddenError('You have no access on this voice channel')

  return voiceChannel
}

export async function createVoiceChannelAction (data: VoiceChannelInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const group = await em.findOneOrFail(Group, data.groupId)

  if (group.owner.id !== currentUser.id) {
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

  if (voiceChannel.group.owner.id !== currentUser.id) {
    throw new ForbiddenError('NO_ACCESS')
  }

  em.assign(voiceChannel, { ...data })
  await em.flush()

  return true
}

export async function deleteVoiceChannelAction (id: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, id, { populate: ['group'] })

  if (voiceChannel.group.owner.id !== currentUser.id) {
    throw new ForbiddenError('NO_ACCESS')
  }

  await em.removeAndFlush(voiceChannel)

  return true
}

export async function connectToVoiceChannelAction (id: string, currentUser: User, io: Server, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, id, { populate: ['group.members', 'users'] })
  const user = await em.findOneOrFail(User, currentUser.id)

  if (!voiceChannel.group.members.getItems().map(member => member.id).includes(currentUser.id)) {
    throw new ForbiddenError('NO_ACCESS')
  }

  voiceChannel.users.add(user)

  await em.flush()

  connectedUserInVoiceChannel(voiceChannel, io)

  return true
}

export async function disconnectFromVoiceChannelAction (id: string, currentUser: User, io: Server, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, id, { populate: ['group', 'users'] })
  const user = await em.findOneOrFail(User, currentUser.id)

  if (!voiceChannel.users.getItems().map(u => u.id).includes(currentUser.id)) {
    throw new UserInputError('You are not connected to this voice channel')
  }

  voiceChannel.users.remove(user)

  await em.flush()

  disconnectUserFromVoiceChannel(voiceChannel, io)

  return true
}

export async function kickFromVoiceChannelAction (id: string, voiceChannelId: string, currentUser: User, io: Server, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, id)

  if (!user.connectedVoiceChannel || user.connectedVoiceChannel.id !== voiceChannelId) throw new UserInputError('USER_IS_NOT_CONNECTED_TO_THIS_VOICE_CHANNEL')

  const voiceChannel = await em.findOneOrFail(VoiceChannel, voiceChannelId, { populate: ['group', 'group.owner'] })

  if (voiceChannel.group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  user.connectedVoiceChannel = undefined

  await em.flush()

  kickFromVoiceChannel(voiceChannel, user, io)

  return true
}
