import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError, ValidationError } from 'apollo-server-koa'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { PRIVATE_KEY } from 'src/dependencies/config'

import { UserPreferencesInputData } from 'src/types/classes/input-data/json-input-data/UserPreferencesInputData'
import { UserRegisterInputData } from 'src/types/classes/input-data/UserRegisterInputData'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'
import { LoginUserInputData } from 'src/types/classes/input-data/LoginUserInputData'

import { PaginatedUsers } from 'src/types/classes/pagination/PaginatedUsers'
import { VoiceChannel } from 'src/types/entities/VoiceChannel'
import { User } from 'src/types/entities/User'

export async function getUsersAction (paginationData: PaginatedInputData, em: EntityManager): Promise<PaginatedUsers> {
  if (!paginationData.filter) paginationData.filter = ''
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit

  const [users, count] = await em.findAndCount(User, {}, {
    limit: paginationData.limit,
    offset,
    populate: []
  })

  return { data: users, total: count }
}

export async function registerUserAction (data: UserRegisterInputData, em: EntityManager): Promise<boolean> {
  // const secret = 'abcdefg'
  const hash = bcrypt.hashSync(data.password, 12)

  let code = (Math.random() * (9999 - 0)).toString()

  if (code.length < 4) {
    for (let i = 0; 3; i--) {
      code = '0' + code
      if (code.length === 4) break
    }
  }

  const preferences: UserPreferencesInputData = {
    inputVolume: 100,
    masterOutputVolume: 100,
    muteInput: false,
    muteOutput: false
  }

  const user = em.create(User, {
    ...data,
    password: hash,
    code,
    displayName: data.username,
    preferences: preferences
  })

  await em.persistAndFlush(user)

  return true
}

export async function loginUserAction (data: LoginUserInputData, em: EntityManager): Promise<string> {
  const user = await em.findOneOrFail(User, { email: data.email })

  if (!bcrypt.compareSync(data.password, user.password)) throw new ValidationError('CREDENTIALS_NOT_MATCH')

  const token = jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username
  }, PRIVATE_KEY)
  return token
}

export async function logoutUserAction (em: EntityManager): Promise<boolean> {
  await em.flush()
  return true
}

export async function updateUserPreferencesAction (data: UserPreferencesInputData, currentUser: User, em: EntityManager): Promise<User> {
  const user = await em.findOneOrFail(User, currentUser.id)

  if (data.masterOutputVolume < 0 || data.masterOutputVolume > 100) throw new UserInputError('MASTER_VOLUME_HAS_RANGE_0-100')
  if (data.inputVolume < 0 || data.inputVolume > 100) throw new UserInputError('MASTER_VOLUME_HAS_RANGE_0-100')

  em.assign(user, { ...data })

  await em.flush()

  return user
}

export async function connectToVoiceChannelAction (voiceChannelId: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, voiceChannelId, ['group'])

  if (!currentUser.groups.contains(voiceChannel.group)) throw new ForbiddenError('NO_ACCESS')

  currentUser.connectedVoiceChannel = voiceChannel

  await em.flush()

  return true
}

export async function disconnectFromVoiceChatAction (currentUser: User, em: EntityManager): Promise<boolean> {
  if (!currentUser.connectedVoiceChannel) throw new UserInputError('YOU_ARE_NOT_CONNECTED_TO_VOICE_CHANNEL')

  currentUser.connectedVoiceChannel = undefined

  await em.flush()

  return true
}

export async function kickFromVoiceChannelAction (id: string, voiceChannelId: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, id)

  if (!user.connectedVoiceChannel || user.connectedVoiceChannel.id !== voiceChannelId) throw new UserInputError('USER_IS_NOT_CONNECTED_TO_THIS_VOICE_CHANNEL')

  const voiceChannel = await em.findOneOrFail(VoiceChannel, voiceChannelId, ['group', 'group.owner'])

  if (voiceChannel.group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  user.connectedVoiceChannel = undefined

  await em.flush()

  return true
}
