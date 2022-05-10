import { EntityManager } from '@mikro-orm/core'
import { UserInputError } from 'apollo-server-koa'
import { FriendRequestInputData } from 'src/types/classes/input-data/FriendRequestInputData'
import { FriendRequest } from 'src/types/entities/FriendRequest'
import { User } from 'src/types/entities/User'

export async function sendFriendRequestAction (data: FriendRequestInputData, currentUser: User, em: EntityManager): Promise<FriendRequest> {
  const toUser = await em.findOneOrFail(User, data.toUserId)

  if (currentUser.friendList.contains(toUser)) {
    throw new UserInputError('THIS_USER_IS_ALREADY_IN_YOUR_FRIEND_LIST')
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
    throw new UserInputError('THIS_REQUEST_ALREADY_EXISTS')
  }

  const friendRequest = em.create(FriendRequest, {
    ...data,
    createdAt: new Date(),
    fromUser: currentUser,
    toUser: toUser
  })

  await em.persistAndFlush(friendRequest)

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
    throw new UserInputError('FRIEND_REQUEST_IS_ALREADY_CANCELLED')
  }

  if (friendRequest.answer) {
    throw new UserInputError('FRIEND_REQUEST_IS_ALREADY_ANSWERED')
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
    throw new UserInputError('FRIEND_REQUEST_IS_ALREADY_CANCELLED')
  }

  if (friendRequest.answer) {
    throw new UserInputError('FRIEND_REQUEST_IS_ALREADY_ANSWERED')
  }

  if (answer) {
    currentUser.friendList.add(friendRequest.toUser)
    friendRequest.toUser.friendList.add(currentUser)
  }

  em.assign(friendRequest, { answer })

  await em.flush()

  return friendRequest
}
