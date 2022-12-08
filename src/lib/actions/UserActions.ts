import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { UserPreferencesInputData } from '../..//types/classes/input-data/json-input-data/UserPreferencesInputData'
import { PaginatedInputData } from '../..//types/classes/input-data/PaginatedInputData'

import { PaginatedUsers } from '../..//types/classes/pagination/PaginatedUsers'
import { VoiceChannel } from '../..//types/entities/VoiceChannel'
import { User } from '../..//types/entities/User'
import { FriendRequest } from '../..//types/entities/FriendRequest'
import { PaginatedFriendRequests } from '../..//types/classes/pagination/PaginatedFriendRequests'
import { Group } from '../..//types/entities/Group'
import { UpdateUserInputData } from '../..//types/classes/input-data/UpdateUserInputData'
import { PRIVATE_KEY } from '../..//dependencies/config'
import { changeEmail } from '../tasks/emails/EmailTexts'
import { Server } from 'socket.io'
import { updateUserEvent } from '../socket/SocketInitEvents'
import { PersonalChatUsersPivot } from '../..//types/entities/PersonalChatUserPivot'

export async function getUsersAction (paginationData: PaginatedInputData, em: EntityManager): Promise<PaginatedUsers> {
  const [users, count] = await em.findAndCount(User, {
    $or: [
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
    offset: (paginationData.limit * paginationData.page) - paginationData.limit,
    populate: ['groups', 'ownedGroups', 'connectedVoiceChannel']

  })

  return { data: users, total: count }
}

export async function getAvailableUsersToAddAction (paginationData: PaginatedInputData, currentUser: User, em: EntityManager): Promise<PaginatedUsers> {
  await em.populate(currentUser, ['friendList'])
  console.log([...currentUser.friendList.getItems().map(fl => fl.id), currentUser.id])
  const [users, count] = await em.findAndCount(User, {
    $and: [
      {
        $or: [
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
      },
      { id: { $nin: [...currentUser.friendList.getItems().map(fl => fl.id), currentUser.id] } }
    ]
  },
  {
    populate: [
      'friendRequests',
      'friendRequests.fromUser'
    ]
  })

  return { data: users, total: count }
}

export async function getAvailableUsersToInviteAction (paginationData: PaginatedInputData, groupId: string, currentUser: User, em: EntityManager): Promise<PaginatedUsers> {
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit

  const group = await em.findOneOrFail(Group, groupId, { populate: ['members'] })

  const [users, count] = await em.findAndCount(User, {
    $and: [
      {
        $or: [
          paginationData.filter
            ? {
                $or: [
                  { displayName: { $like: `%${paginationData.filter}%` } },
                  { email: { $like: `%${paginationData.filter}%` } },
                  { username: { $ilike: `%${paginationData.filter}%` } }
                ]
              }
            : {}
        ]
      },
      { id: { $nin: [...group.members.getItems().map(me => me.id), currentUser.id] } }
    ]
  }, {
    limit: paginationData.limit > 0 ? paginationData.limit : undefined,
    offset,
    populate: [
      'groupInvites',
      'groupInvites.group',
      'groupInvites.fromUser',
      'myGroupInvites',
      'groups'
    ]
  })

  return { data: users, total: count }
}

export async function getLoggedUserAction (currentUser: User, em: EntityManager): Promise<User> {
  const user = await em.findOneOrFail(User, currentUser.id, {
    populate: [
      'connectedVoiceChannel.users',
      'connectedVoiceChannel.group',
      'groupInvites.fromUser',
      'myGroupInvites.toUser',
      'ownedGroups',
      'myFriendRequests.toUser',
      'friendList',
      'personalChats.personalChat',
      'groups',
      'friendRequests.fromUser.groups',
      'friendRequests.fromUser.ownedGroups'
    ],
    populateWhere: {
      friendRequests: {
        answer: { $eq: undefined },
        canceled: { $eq: undefined }
      },
      groupInvites: {
        answer: { $eq: undefined },
        canceled: { $eq: undefined },
        fromUser: { id: { $ne: currentUser.id } }
      }
    }
  })

  const personalChats = await Promise.all(user.personalChats.getItems().map(async (pC): Promise<PersonalChatUsersPivot> => {
    const kati = await pC.personalChat.messages.matching({ limit: 1, offset: 0 })
    em.assign(pC.personalChat, { messages: kati })

    return pC
  }))

  em.assign(user, {
    personalChats: personalChats
  })

  em.clear()

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
          },
          answer: { $eq: undefined }
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

export async function updateUserAction (data: UpdateUserInputData, currentUser: User, io: Server, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, currentUser.id, { populate: ['groups', 'friendList'] })
  if (data.username) {
    const usernameOrEmailExist = await em.findOne(User, {
      $or: [
        data.username ? { username: data.username } : { username: undefined }
      ],
      id: { $ne: currentUser.id }
    })

    if (usernameOrEmailExist) throw new UserInputError('This username already exist')
  }

  em.assign(user, data)

  await em.flush()

  updateUserEvent(user, io)

  return true
}

export async function updateUserEmailAction (newEmail: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, currentUser.id)
  if (user.email === newEmail) throw new UserInputError('You are already using this email')

  const emailExists = await em.find(User, { email: newEmail })

  if (emailExists) throw new UserInputError('This email is already in use')

  const changeEmailToken = jwt.sign({
    id: user.id,
    email: user.email,
    newEmail
  }, PRIVATE_KEY, {
    algorithm: 'HS256'
  })

  await changeEmail(user, newEmail, changeEmailToken)

  return true
}

export async function updateUserPasswordAction (newPassword: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, currentUser.id)

  if (bcrypt.compareSync(newPassword, user.password)) throw new UserInputError('You are already using this password')

  user.password = newPassword
  await em.flush()

  return true
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

export async function kickFromVoiceChannelAction (id: string, voiceChannelId: string, currentUser: User, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, id)

  if (!user.connectedVoiceChannel || user.connectedVoiceChannel.id !== voiceChannelId) throw new UserInputError('USER_IS_NOT_CONNECTED_TO_THIS_VOICE_CHANNEL')

  const voiceChannel = await em.findOneOrFail(VoiceChannel, voiceChannelId, { populate: ['group', 'group.owner'] })

  if (voiceChannel.group.owner.id !== currentUser.id) throw new ForbiddenError('NO_ACCESS')

  user.connectedVoiceChannel = undefined

  await em.flush()

  return true
}

export async function deleteFriendAction (id: string, currentUser: User, em: EntityManager): Promise<boolean> {
  if (id === currentUser.id) throw new UserInputError('You cannot delete yourself')

  const userToDelete = await em.findOneOrFail(User, id, { populate: ['friendList'] })
  const user = await em.findOneOrFail(User, currentUser.id, { populate: ['friendList'] })

  if (!user.friendList.getItems().map(fl => fl.id).includes(userToDelete.id)) throw new UserInputError('This user is not in your friendlist')

  userToDelete.friendList.remove(user)
  user.friendList.remove(userToDelete)

  await em.flush()

  return true
}
