import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import jwt from 'jsonwebtoken'

import { PRIVATE_KEY } from 'src/dependencies/config'

import { UserPreferencesInputData } from 'src/types/classes/input-data/json-input-data/UserPreferencesInputData'
import { PaginatedInputData } from 'src/types/classes/input-data/PaginatedInputData'

import { PaginatedUsers } from 'src/types/classes/pagination/PaginatedUsers'
import { VoiceChannel } from 'src/types/entities/VoiceChannel'
import { User } from 'src/types/entities/User'
import { PersonalChat } from 'src/types/entities/PersonalChat'
import { PersonalMessage } from 'src/types/entities/PersonalMessage'
import { FriendRequest } from 'src/types/entities/FriendRequest'
import { PaginatedFriendRequests } from 'src/types/classes/pagination/PaginatedFriendRequests'

export async function getUsersAction (paginationData: PaginatedInputData, em: EntityManager): Promise<PaginatedUsers> {
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit

  const [users, count] = await em.findAndCount(User, {
    $and: [
      paginationData.filter
        ? {
            $or: [
              { displayName: { $like: `%${paginationData.filter}%` } },
              { email: { $like: `%${paginationData.filter}%` } },
              { username: { $like: `%${paginationData.filter}%` } }
            ]
          }
        : {}
    ]
  }, {
    limit: paginationData.limit > 0 ? paginationData.limit : undefined,
    offset,
    populate: ['groups']
  })

  return { data: users, total: count }
}

export async function getLoggedUserAction (currentUser: User, em: EntityManager): Promise<User> {
  const user = await em.findOneOrFail(User, currentUser.id, {
    populate: [
      'connectedVoiceChannel',
      'connectedVoiceChannel.users',
      'connectedVoiceChannel.group',
      'groups',
      'ownedGroups',
      'friendRequests',
      'myFriendRequests',
      'friendList',
      'personalChats',
      'friendRequests.fromUser',
      'friendRequests.fromUser.groups',
      'friendRequests.fromUser.ownedGroups'
    ]
  })

  const personalChats = await em.find(PersonalChat, {
    users: { id: currentUser.id }
  }, {
    orderBy: { messages: { createdAt: 'DESC' } },
    populate: ['messages']
  })

  const firstPersonalChatsMessages = await em.find(PersonalMessage, { personalChat: { $in: personalChats } }, {
    limit: 1,
    offset: 1,
    orderBy: { createdAt: 'DESC' },
    populate: [
      'personalChat'
    ]
  })

  personalChats.forEach((personalChat, index) => {
    personalChat.messages.add(firstPersonalChatsMessages.find(message => message.personalChat.id === personalChat.id) as PersonalMessage)
    personalChats[index] = personalChat
  })
  user.personalChats.set(personalChats)

  return user
}

export async function getFriendRequestsAction (paginationData: PaginatedInputData, forMe: boolean, currentUser: User, em: EntityManager): Promise<PaginatedFriendRequests> {
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit
  paginationData.filter = paginationData.filter ?? ''

  const [friendRequests, count] = await em.findAndCount(FriendRequest,
    forMe
      ? {
          toUser: {
            $and: [
              { id: currentUser.id },
              { username: { $like: `%${paginationData.filter}%` } },
              { email: { $like: `%${paginationData.filter}%` } },
              { displayName: { $like: `%${paginationData.filter}%` } },
              { code: { $like: `%${paginationData.filter}%` } }
            ]
          }
        }
      : {
          fromUser: {
            $and: [
              { id: currentUser.id },
              { username: { $like: `%${paginationData.filter}%` } },
              { email: { $like: `%${paginationData.filter}%` } },
              { displayName: { $like: `%${paginationData.filter}%` } },
              { code: { $like: `%${paginationData.filter}%` } }
            ]
          }
        }
    , {
      populate: [forMe ? 'fromUser' : 'toUser'],
      offset,
      limit: paginationData.limit > 0 ? paginationData.limit : undefined
    })

  return { data: friendRequests, total: count }
}

export async function refreshTokenAction (currentUser: User, em: EntityManager): Promise<string> {
  const token = jwt.sign({
    id: currentUser.id,
    email: currentUser.email,
    username: currentUser.username,
    displayName: currentUser.displayName,
    icon: currentUser.icon,
    preferences: currentUser.preferences,
    code: currentUser.code
  }, PRIVATE_KEY, { expiresIn: '1h' })

  currentUser.jwtToken = token

  await em.flush()

  return token
}

export async function logoutUserAction (currentUser: User, em: EntityManager): Promise<boolean> {
  currentUser.jwtToken = undefined

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

export async function getAvailableUsersToAddAction (currentUser: User, em: EntityManager, pending?: boolean): Promise<PaginatedUsers> {
  const [users, count] = await em.findAndCount(User, {
    id: { $ne: currentUser.id },
    friendList: { $nin: [currentUser.id] },
    friendRequests: !pending ? { $nin: [currentUser.id] } : {}
  })

  return { data: users, total: count }
}
