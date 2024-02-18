import { EntityManager } from '@mikro-orm/core'
import { ForbiddenError, UserInputError } from 'apollo-server-koa'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { UserPreferencesInputData } from '../../types/classes/input-data/json-input-data/UserPreferencesInputData'
import { PaginatedInputData } from '../../types/classes/input-data/PaginatedInputData'

import { PaginatedUsers } from '../../types/classes/pagination/PaginatedUsers'
import { VoiceChannel } from '../../types/entities/VoiceChannel'
import { User } from '../../types/entities/User'
import { FriendRequest } from '../../types/entities/FriendRequest'
import { PaginatedFriendRequests } from '../../types/classes/pagination/PaginatedFriendRequests'
import { Group } from '../../types/entities/Group'
import { UpdateUserInputData } from '../../types/classes/input-data/UpdateUserInputData'
import { PRIVATE_KEY } from '../../dependencies/config'
import { changeEmail } from '../tasks/emails/EmailTexts'
import { Server } from 'socket.io'
import { updatePersonalChatEvent, updateUserEvent } from '../socket/SocketInitEvents'
import { PersonalChat } from '../../types/entities/PersonalChat'
import { PersonalMessage } from '../../types/entities/PersonalMessage'
import { PersonalChatUserPivot } from '../../types/entities/LastReadMessagePivot'

export async function getUsersAction (paginationData: PaginatedInputData, em: EntityManager): Promise<PaginatedUsers> {
  const search = paginationData.filter ? { $like: `%${paginationData.filter}%` } : undefined

  const [users, count] = await em.findAndCount(User, {
    $or: [
      search
        ? {
            $or: [
              { displayName: search },
              { email: search },
              { username: search },
              { code: search }
            ]
          }
        : {}
    ]
  }, {
    limit: paginationData.limit > 0 ? paginationData.limit : undefined,
    offset: (paginationData.limit * paginationData.page) - paginationData.limit,
    populate: ['groups', 'ownedGroups', 'connectedVoiceChannel', 'personalChats.messages']

  })

  return { data: users, total: count }
}

export async function getAvailableUsersToAddAction (paginationData: PaginatedInputData, currentUser: User, em: EntityManager): Promise<PaginatedUsers> {
  await em.populate(currentUser, ['friendList'])
  console.log('friend list hehe', currentUser.friendList.getItems().map(fl => fl.id))
  const search = paginationData.filter ? { $like: `%${paginationData.filter}%` } : undefined

  const [users, count] = await em.findAndCount(User, {
    $and: [
      {
        $or: [
          paginationData.filter
            ? {
                $or: [
                  { displayName: search },
                  { email: search },
                  { username: search },
                  { code: search }
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
      'friendRequests.fromUser',
      'personalChats'
    ]
  })

  return { data: users, total: count }
}

export async function getAvailableUsersToInviteAction (paginationData: PaginatedInputData, groupId: string, currentUser: User, em: EntityManager): Promise<PaginatedUsers> {
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit
  const search = paginationData.filter ? { $like: `%${paginationData.filter}%` } : undefined

  const group = await em.findOneOrFail(Group, groupId, { populate: ['members'] })

  const [users, count] = await em.findAndCount(User, {
    $and: [
      {
        $or: [
          paginationData.filter
            ? {
                $or: [
                  { displayName: search },
                  { email: search },
                  { username: search },
                  { code: search }
                ]
              }
            : {}
        ]
      },
      { id: { $nin: [...group.members.getItems().map(me => me.id), currentUser.id, group.owner.id] } }
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
      'groupInvites.fromUser',
      'groupInvites.group.members',
      'myGroupInvites.toUser',
      'ownedGroups',
      'myFriendRequests.toUser',
      'friendList',
      'groups',
      'friendRequests.fromUser.groups',
      'friendRequests.fromUser.ownedGroups',
      'personalChats'
    ],
    populateWhere: {
      friendRequests: {
        updatedAt: null,
        fromUser: { id: { $ne: currentUser.id } }
      },
      groupInvites: {
        updatedAt: null,
        fromUser: { id: { $ne: currentUser.id } }
      }
    }
  })
  const prePersonaChats = user.personalChats.getItems()

  await em.populate(prePersonaChats, ['users'], {
    where: {
      users: { id: { $ne: currentUser.id } }
    }
  })
  em.clear()

  const personalChats = await Promise.all(prePersonaChats.map(async (pC): Promise<PersonalChat> => {
    const messages = await pC.messages.matching({ limit: 1, offset: 0, orderBy: { createdAt: 'DESC' } })
    const users = pC.users.getItems()
    const personalChatUserPivot = await em.findOneOrFail(PersonalChatUserPivot, { user: currentUser.id, personalChat: pC.id }, {
      populate: ['lastReadMessage']
    })

    const totalUnreadMessages = await em.count(PersonalMessage, {
      $and: [
        { personalChat: pC.id },
        personalChatUserPivot.lastReadMessage ? { createdAt: { $gt: personalChatUserPivot.lastReadMessage.createdAt } } : {}
      ]
    })

    pC.sortMessageValue = (messages[0]?.createdAt ?? (await em.findOneOrFail(FriendRequest, {
      $or: [
        {
          fromUser: currentUser.id,
          toUser: pC.users.getItems().find(user => user.id !== currentUser.id),
          answer: true
        },
        {
          fromUser: pC.users.getItems().find(user => user.id !== currentUser.id),
          toUser: currentUser.id,
          answer: true
        }
      ]
    }, {
      orderBy: {
        updatedAt: 'DESC'
      }
    })).updatedAt!).valueOf()

    Object.assign(pC, { messages, users, totalUnreadMessages })

    return pC
  }))

  personalChats.sort((a, b) => b.sortMessageValue! - a.sortMessageValue!)

  Object.assign(user, {
    personalChats: personalChats
  })

  em.clear()

  return user
}

export async function getFriendRequestsAction (paginationData: PaginatedInputData, forMe: boolean, currentUser: User, em: EntityManager): Promise<PaginatedFriendRequests> {
  const offset = (paginationData.limit * paginationData.page) - paginationData.limit
  const search = paginationData.filter ? { $like: `%${paginationData.filter}%` } : undefined

  const [friendRequests, count] = await em.findAndCount(FriendRequest,
    forMe
      ? {
          toUser:
                {
                  $and: [
                    { id: currentUser.id },
                    search
                      ? {
                          $or: [
                            { displayName: search },
                            { email: search },
                            { username: search },
                            { code: search }
                          ]
                        }
                      : {}
                  ]
                },
          updatedAt: null
        }
      : {
          fromUser: {
            $and: [
              { id: currentUser.id },
              search
                ? {
                    $or: [
                      { displayName: search },
                      { email: search },
                      { username: search },
                      { code: search }
                    ]
                  }
                : {}
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
  const user = await em.findOneOrFail(User, currentUser.id, {
    populate: ['groups', 'friendList'],
    populateWhere: {
      friendList: {
        isLoggedIn: true
      }
    }
  })
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

export async function getUserByIdAction (id: string, _currentUser: User, em: EntityManager): Promise<User> {
  // todo add permission populating
  const user = await em.findOneOrFail(User, id)

  return user
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
  const user = await em.findOneOrFail(User, currentUser.id)
  em.assign(user, {
    jwtToken: undefined,
    isLoggedIn: false,
    lastLoggedInDate: new Date()
  })

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

export async function deleteFriendAction (id: string, currentUser: User, io: Server, em: EntityManager): Promise<boolean> {
  if (id === currentUser.id) throw new UserInputError('You cannot delete yourself')

  const userToDelete = await em.findOneOrFail(User, id, { populate: ['friendList', 'personalChats'] })
  const user = await em.findOneOrFail(User, currentUser.id, { populate: ['friendList', 'personalChats'] })

  if (!user.friendList.getItems().map(fl => fl.id).includes(userToDelete.id)) throw new UserInputError('This user is not in your friendlist')

  userToDelete.friendList.remove(user)
  user.friendList.remove(userToDelete)

  await em.flush()

  const personalChatId = userToDelete.personalChats.getItems().map(pC => pC.id).find(pC1 => user.personalChats.getItems().find(pC2 => pC2.id === pC1 && !pC2.isGroupPersonalChat))
  await em.nativeUpdate(PersonalChat, {
    id: personalChatId
  }, {
    disabled: true
  })

  const personalChat = user.personalChats.getItems().find(pC2 => pC2.id === personalChatId)
  personalChat!.disabled = true

  updatePersonalChatEvent([currentUser.id, userToDelete.id], personalChat!, io)

  return true
}
