import { EntityManager } from '@mikro-orm/core'
import { UserInputError } from 'apollo-server-koa'
import { Server } from 'socket.io'

import { FriendRequestInputData } from '../../types/classes/input-data/FriendRequestInputData'
import { FriendRequest } from '../../types/entities/FriendRequest'
import { PersonalChat } from '../../types/entities/PersonalChat'
import { User } from '../../types/entities/User'

import { sendReceiveAnswerFriendRequest, sendReceiveFriendRequest } from '../socket/SocketInitEvents'

export async function sendFriendRequestAction (data: FriendRequestInputData, currentUser: User, io: Server, em: EntityManager): Promise<FriendRequest> {
  if (data.toUserId === currentUser.id) {
    throw new UserInputError('You cannot send a friend request to yourself')
  }
  const user = await em.findOneOrFail(User, currentUser.id, {
    populate: ['friendList']
  })

  const toUser = await em.findOneOrFail(User, data.toUserId)

  if (user.friendList.contains(toUser)) {
    throw new UserInputError('You are already friends with this user')
  }

  const friendRequestExists = await em.count(FriendRequest, {
    $or: [
      {
        $and: [
          { fromUser: user },
          { toUser: toUser },
          { canceled: { $eq: null } },
          { answer: { $eq: null } }
        ]
      },
      {
        $and: [
          { fromUser: toUser },
          { toUser: user },
          { canceled: { $eq: null } },
          { answer: { $eq: null } }
        ]
      }
    ]
  })

  if (friendRequestExists) {
    throw new UserInputError('You already sent a friend request to this user')
  }

  const friendRequest = em.create(FriendRequest, {
    message: data.message,
    createdAt: new Date(),
    fromUser: user,
    toUser: toUser
  })

  await em.persistAndFlush(friendRequest)

  await em.populate(friendRequest, ['fromUser', 'toUser'])

  sendReceiveFriendRequest(io, friendRequest)

  return friendRequest
}

export async function cancelFriendRequestAction (id: string, currentUser: User, em: EntityManager): Promise<FriendRequest> {
  const user = await em.findOneOrFail(User, currentUser.id, {
    populate: ['friendList']
  })

  const friendRequest = await em.findOneOrFail(FriendRequest, {
    $and: [
      { id: { $eq: id } },
      { fromUser: { $eq: user } }
    ]
  })

  if (friendRequest.canceled) {
    throw new UserInputError('This friend request has already been canceled')
  }

  if ((!friendRequest.answer && friendRequest.answer === false) || friendRequest.answer) {
    throw new UserInputError('This friend request has already been answered')
  }

  em.assign(friendRequest, { canceled: true, updatedAt: new Date() })

  await em.flush()

  return friendRequest
}

export async function answerFriendRequestAction (id: string, answer: boolean, currentUser: User, io: Server, em: EntityManager): Promise<FriendRequest> {
  const user = await em.findOneOrFail(User, currentUser.id, { populate: ['friendList'] })
  const friendRequest = await em.findOneOrFail(FriendRequest, {
    $and: [
      { id: { $eq: id } },
      { toUser: { $eq: currentUser } }
    ]
  },
  { populate: ['fromUser'] })

  if (friendRequest.canceled) {
    throw new UserInputError('This friend request is canceled')
  }

  if (friendRequest.answer !== null) {
    throw new UserInputError('This friend request has been answered')
  }
  let personalChat: PersonalChat | null = null

  if (answer) {
    user.friendList.add(friendRequest.fromUser)
    friendRequest.fromUser.friendList.add(user)
    personalChat = await em.findOne(PersonalChat, {
      $and: [
        {
          users: friendRequest.toUser
        },
        {
          users: friendRequest.fromUser
        }
      ]
    })

    if (!personalChat) {
      personalChat = em.create(PersonalChat, {
        mute: false
      })
      em.persist(personalChat)
      personalChat.users.add(user)
      personalChat.users.add(friendRequest.fromUser)
    }
    personalChat.disabled = false
  }

  em.assign(friendRequest, { answer, updatedAt: new Date() })

  await em.flush()

  if (personalChat) {
    sendReceiveAnswerFriendRequest(io, friendRequest, personalChat)
  }

  return friendRequest
}
