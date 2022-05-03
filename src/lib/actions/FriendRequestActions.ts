import { EntityManager } from '@mikro-orm/core'
import { UserInputError } from 'apollo-server-koa'
import { FriendRequestInputData } from 'src/types/classes/input-data/FriendRequestInputData'
import { FriendRequest } from 'src/types/entities/FriendRequest'
import { User } from 'src/types/entities/User'

export async function sendFriendRequestAction (data: FriendRequestInputData, currentUser: User, em: EntityManager): Promise<boolean> {
  const toUser = await em.findOneOrFail(User, data.toUserId)

  const user = await em.findOneOrFail(User, { id: 'a3fd5f56-f0c6-48d9-b393-a52780b90547' })

  // if (user.friendList.length && user.friendList.contains(toUser)) {
  //   throw new UserInputError('THIS_USER_IS_ALREADY_IN_YOUR_FRIEND_LIST')
  // }

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
    throw new UserInputError('THIS_REQUEST_ALREADY_EXISTS')
  }

  const friendRequest = em.create(FriendRequest, {
    ...data,
    createdAt: new Date(),
    fromUser: user,
    toUser: toUser
  })

  await em.persistAndFlush(friendRequest)

  return true
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
  const user = await em.findOneOrFail(User, { id: 'a3fd5f56-f0c6-48d9-b393-a52780b90547' })
  const friendRequest = await em.findOneOrFail(FriendRequest, {
    $and: [
      { id: { $eq: id } },
      { toUser: { $eq: user } }
    ]
  },
  ['toUser'])

  if (friendRequest.canceled) {
    throw new UserInputError('FRIEND_REQUEST_IS_ALREADY_CANCELLED')
  }

  if (friendRequest.answer) {
    throw new UserInputError('FRIEND_REQUEST_IS_ALREADY_ANSWERED')
  }

  if (answer) {
    user.friendList.add(friendRequest.toUser)
    friendRequest.toUser.friendList.add(user)
  }

  em.assign(friendRequest, { answer })

  await em.flush()

  return friendRequest
}
