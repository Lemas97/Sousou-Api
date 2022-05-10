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
import { confirmEmailOnRegister } from '../tasks/emails/RegisterEmail'
import { v4 } from 'uuid'
import { PersistedQueryNotFoundError } from 'apollo-server-errors'
import { PersonalChat } from 'src/types/entities/PersonalChat'
import { PersonalMessage } from 'src/types/entities/PersonalMessage'

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

export async function getLoggedUserAction (currentUser: User, em: EntityManager): Promise<User> {
  const user = await em.findOneOrFail(User, currentUser.id, { populate: ['groups'] })

  const personalChats = await em.find(PersonalChat, {
    users: { id: { $in: [currentUser.id] } }
  }, {
    orderBy: { messages: { createdAt: 'DESC' } }
  })

  const firstPersonalChatsMessages = await em.find(PersonalMessage, { personalChat: { $in: personalChats } }, {
    limit: 1,
    offset: 1,
    orderBy: { createdAt: 'DESC' },
    populate: ['personalChat']
  })

  personalChats.forEach((personalChat, index) => {
    personalChat.messages.add(firstPersonalChatsMessages.find(message => message.personalChat.id === personalChat.id) as PersonalMessage)
    personalChats[index] = personalChat
  })

  user.personalChats.set(personalChats)

  return user
}

export async function registerUserAction (data: UserRegisterInputData, em: EntityManager): Promise<boolean> {
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
    emailConfirm: false,
    icon: '',
    createdAt: new Date(),
    password: hash,
    code,
    displayName: data.username,
    preferences: preferences,
    confirmEmailToken: v4()
  })

  await em.persistAndFlush(user)

  await confirmEmailOnRegister(user)

  return true
}

export async function loginUserAction (data: LoginUserInputData, em: EntityManager): Promise<string> {
  const user = await em.findOneOrFail(User, { email: data.email })

  if (!user.emailConfirm) throw new ForbiddenError('EMAIL_NOT_CONFIRMED')

  if (!bcrypt.compareSync(data.password, user.password)) throw new ValidationError('CREDENTIALS_NOT_MATCH')

  const token = jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    icon: user.icon,
    preferences: user.preferences,
    code: user.code
  }, PRIVATE_KEY, { expiresIn: '1h' })
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

  em.assign(user, {
    preferences: data
  })

  await em.flush()

  return user
}

export async function connectToVoiceChannelAction (voiceChannelId: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const voiceChannel = await em.findOneOrFail(VoiceChannel, voiceChannelId, { populate: ['group'] })

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

  const voiceChannel = await em.findOneOrFail(VoiceChannel, voiceChannelId, { populate: ['group', 'group.owner'] })

  if (voiceChannel.group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  user.connectedVoiceChannel = undefined

  await em.flush()

  return true
}

export async function confirmEmailAction (confirmEmailToken: string, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, { confirmEmailToken })

  if (user.emailConfirm) throw new UserInputError('USER_IS_ALREADY_CONFIRMED')

  user.emailConfirm = true

  await em.flush()

  return true
}

export async function resendEmailConfirmationAction (email: string, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, { email })

  if (user.emailConfirm) throw new PersistedQueryNotFoundError()

  user.confirmEmailToken = v4()
  await em.flush()

  await confirmEmailOnRegister(user)

  return true
}
