import { EntityManager } from '@mikro-orm/core'
import { UserInputError } from 'apollo-server-koa'
import { FriendRequestInputData } from 'src/types/classes/input-data/FriendRequestInputData'
import { FriendRequest } from 'src/types/entities/FriendRequest'
import { User } from 'src/types/entities/User'

export async function sendFriendRequestAction (data: FriendRequestInputData, currentUser: User, em: EntityManager): Promise<FriendRequest> {
  if (data.toUserId === currentUser.id) {
    throw new UserInputError('You cannot send a friend request to yourself')
  }

  const toUser = await em.findOneOrFail(User, data.toUserId)

  await em.populate(currentUser, ['friendList'])

  if (currentUser.friendList.contains(toUser)) {
    throw new UserInputError('You are already friends with this user')
  }

  const friendRequestExists = await em.count(FriendRequest, {
    $or: [
      {
        $and: [
          { fromUser: currentUser },
          { toUser: toUser },
          { canceled: { $eq: null } },
          { answer: { $eq: null } }
        ]
      },
      {
        $and: [
          { fromUser: toUser },
          { toUser: currentUser },
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
    fromUser: currentUser,
    toUser: toUser
  })

  await em.persistAndFlush(friendRequest)

  await em.populate(friendRequest, ['fromUser', 'toUser'])

  return friendRequest
}

export async function cancelFriendRequestAction (id: string, currentUser: User, em: EntityManager): Promise<FriendRequest> {
  const friendRequest = await em.findOneOrFail(FriendRequest, {
    $and: [
      { id: { $eq: id } },
      { fromUser: { $eq: currentUser } }
    ]
  })

  if (friendRequest.canceled) {
    throw new UserInputError('This friend request has already been canceled')
  }

  if (friendRequest.answer) {
    throw new UserInputError('This friend request has already been answered')
  }

  em.assign(friendRequest, { canceled: true })

  await em.flush()

  return friendRequest
}

export async function answerFriendRequestAction (id: string, answer: boolean, currentUser: User, em: EntityManager): Promise<FriendRequest> {
  const friendRequest = await em.findOneOrFail(FriendRequest, {
    $and: [
      { id: { $eq: id } },
      { toUser: { $eq: currentUser } }
    ]
  },
  { populate: ['toUser'] })

  if (friendRequest.canceled) {
    throw new UserInputError('This friend request has already been canceled')
  }

  if (friendRequest.answer) {
    throw new UserInputError('This friend request has already been answered')
  }

  if (answer) {
    currentUser.friendList.add(friendRequest.toUser)
    friendRequest.toUser.friendList.add(currentUser)
  }

  em.assign(friendRequest, { answer })

  await em.flush()

  return friendRequest
}
