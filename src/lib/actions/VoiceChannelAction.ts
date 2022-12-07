import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import { Server } from 'socket.io'
import { VoiceChannelInputData } from '../..//types/classes/input-data/VoiceChannelInputData'
import { Group } from '../..//types/entities/Group'
import { User } from '../..//types/entities/User'
import { VoiceChannel } from '../..//types/entities/VoiceChannel'
import { connectedUserInVoiceChannel, disconnectUserInVoiceChannel } from '../socket/SocketInitEvents'

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

  disconnectUserInVoiceChannel(voiceChannel, io)

  return true
}

export async function disconnectOtherUserAction (id: string, userId: string, currentUser: User, io: Server, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, id, { populate: ['group.owner', 'users'] })
  const userToDisconnect = await em.findOneOrFail(User, userId)

  if (currentUser.id !== voiceChannel.group.owner.id) throw new ForbiddenError('You cannot disconnect another user from a voice channel')

  if (!voiceChannel.users.getItems().map(u => u.id).includes(userToDisconnect.id)) {
    throw new UserInputError('This User is not connected to this voice channel')
  }

  voiceChannel.users.remove(userToDisconnect)

  await em.flush()

  disconnectUserInVoiceChannel(voiceChannel, io)

  return true
}
