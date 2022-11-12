import { EntityManager } from '@mikro-orm/core'
import { v4 } from 'uuid'
import bcrypt from 'bcrypt'

import { getConnection } from 'tests/createConnection'
import { User } from 'src/types/entities/User'
import { FriendRequestInputData } from 'src/types/classes/input-data/FriendRequestInputData'
import { sendFriendRequestAction } from 'src/lib/actions/FriendRequestActions'

let em: EntityManager
beforeEach(async () => {
  em = (await getConnection()).em.fork()

  await em.begin()
})

afterEach(async () => {
  clearData()
  await em.rollback()
})

let userData = {
  id: v4(),
  isLogged: false,
  emailConfirm: false,
  icon: '',
  username: 'lemas97',
  email: 'tilemachos@example.com',
  createdAt: new Date(),
  password: '',
  code: '1414',
  displayName: 'tilemachos',
  preferences: {},
  confirmEmailToken: v4()
}

const clearData = (): void => {
  userId = v4()

  userData = {
    id: userId,
    isLogged: false,
    emailConfirm: false,
    icon: '',
    username: 'lemas97',
    email: 'tilemachos@example.com',
    createdAt: new Date(),
    password: 'password',
    code: '1414',
    displayName: 'tilemachos',
    preferences: {},
    confirmEmailToken: v4()
  }
  friendRequestData.toUserId = userId
}

const generateNewUserDetails = (): void => {
  userData = {
    ...userData,
    id: v4(),
    email: v4(),
    username: v4()
  }
}

async function createBasicUser (data?: any): Promise<User> {
  em.clear()
  const hash = bcrypt.hashSync(data?.password ?? userData.password, 12)
  const user = em.create(User, !data ? { ...userData, password: hash } : { ...data, password: hash })
  await em.persistAndFlush(user)

  return user
}

let userId = v4()

const friendRequestData: FriendRequestInputData = {
  message: 'hello',
  toUserId: userId
}

describe('FriendRequestAction: sendFriendRequestAction', () => {
  test('sendFriendRequestAction sending request to yourself', async () => {
    expect.assertions(1)
    userData.id = userId
    const currentUser = await createBasicUser()

    await expect(async () => await sendFriendRequestAction(friendRequestData, currentUser, em)).rejects.toThrow('You cannot send a friend request to yourself')
  })
  test('sendFriendRequestAction user not found', async () => {
    expect.assertions(1)

    const currentUser = await createBasicUser()
    friendRequestData.toUserId = 'fake_user_id'

    await expect(async () => await sendFriendRequestAction(friendRequestData, currentUser, em)).rejects.toThrow()
  })
  test('sendFriendRequestAction already friends', async () => {
    expect.assertions(1)
    const user = await createBasicUser()
    generateNewUserDetails()

    let currentUser = await createBasicUser()

    user.friendList.add(currentUser)
    currentUser.friendList.add(user)

    await em.flush()

    currentUser = await em.findOneOrFail(User, currentUser.id, { populate: ['friendList'] })

    await expect(async () => await sendFriendRequestAction(friendRequestData, currentUser, em)).rejects.toThrow('You are already friends with this user')
  })
})
