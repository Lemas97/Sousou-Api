import { EntityManager } from '@mikro-orm/core'
import { v4 } from 'uuid'
import bcrypt from 'bcrypt'

import { getConnection } from 'tests/createConnection'
import { User } from 'src/types/entities/User'
import { confirmChangeEmailAction, confirmEmailAction, loginUserAction, refreshTokenAction, registerUserAction, resendEmailConfirmationAction, usernameExistsAction } from 'src/lib/actions/AuthFreeActions'
import { UserRegisterInputData } from 'src/types/classes/input-data/UserRegisterInputData'

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
  userData = {
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
}

async function createBasicUser (data?: any): Promise<User> {
  em.clear()
  const hash = bcrypt.hashSync(data?.password ?? userData.password, 12)
  const user = em.create(User, !data ? { ...userData, password: hash } : { ...data, password: hash })
  await em.persistAndFlush(user)

  return user
}

describe('AuthAction: registerUser', () => {
  test('register error: not unique email', async () => {
    expect.assertions(1)

    await createBasicUser()

    const data: UserRegisterInputData = {
      username: 'tilemachos',
      email: 'tilemachos@example.com',
      displayName: 'tilemachos',
      password: 'password1'
    }

    await expect(async () => await registerUserAction(data, em)).rejects.toThrow()
  })
  test('register error: not unique username', async () => {
    expect.assertions(1)

    await createBasicUser()

    const data: UserRegisterInputData = {
      username: 'lemas97',
      email: 'lemas97@example.com',
      displayName: 'tilemachos',
      password: 'password1'
    }

    await expect(async () => await registerUserAction(data, em)).rejects.toThrow()
  })
  test('register done', async () => {
    expect.assertions(4)

    const data: UserRegisterInputData = {
      username: 'tilemachos',
      email: 'tilemachos@example.com',
      displayName: 'tilemachos',
      password: 'password1'
    }

    const confirmV4 = await registerUserAction(data, em)
    const result = await em.findOneOrFail(User, { email: data.email })

    expect(result.emailConfirm).toBeFalsy()
    expect(result.confirmEmailToken).toHaveLength(36)
    expect(result.confirmEmailToken).toBe(confirmV4)
    expect(bcrypt.compareSync(data.password, result.password)).toBeTruthy()
  })
})
describe('AuthAction: usernameExistsAction', () => {
  test('username exists', async () => {
    expect.assertions(1)

    await createBasicUser()

    const usernameExists = await usernameExistsAction('lemas97', em)

    expect(usernameExists).toBeTruthy()
  })
  test('username not exists', async () => {
    expect.assertions(1)

    await createBasicUser()

    const usernameExists = await usernameExistsAction('tilemachos', em)

    expect(usernameExists).toBeFalsy()
  })
})
describe('AuthAction: loginUserAction', () => {
  test('email or username does not exist', async () => {
    expect.assertions(1)

    await createBasicUser()

    await expect(async () => await loginUserAction({
      email: 'notExistinEmail@example.com',
      password: 'not_matter'
    }, em)).rejects.toThrow()
  })
  test('email not confirmed', async () => {
    expect.assertions(1)

    await createBasicUser()

    await expect(async () => await loginUserAction({
      ...userData
    }, em)).rejects.toThrow('EMAIL_NOT_CONFIRMED')
  })
  test('wrong password', async () => {
    expect.assertions(1)

    const user = await createBasicUser()
    em.assign(user, { emailConfirm: true })
    await em.flush()

    await expect(async () => await loginUserAction({
      ...userData,
      password: 'wrong_password'
    }, em)).rejects.toThrow('CREDENTIALS_NOT_MATCH')
  })
  test('correct login', async () => {
    expect.assertions(1)

    const user = await createBasicUser()
    em.assign(user, { emailConfirm: true })
    await em.flush()

    console.log(user.password)

    await loginUserAction({
      ...userData
    }, em)

    const result = await em.findOneOrFail(User, user.id)

    expect(result.jwtToken).not.toBeNull()
  })
})
describe('AuthAction: confirmEmailAction', () => {
  test('confirmEmailAction not found confirmEmailId', async () => {
    expect.assertions(1)

    await createBasicUser()

    await expect(async () => await confirmEmailAction('notId', em)).rejects.toThrow()
  })
  test('confirmEmailAction USER_IS_ALREADY_CONFIRMED', async () => {
    expect.assertions(1)

    const user = await createBasicUser()
    em.assign(user, { emailConfirm: true })
    await em.flush()

    await expect(async () => await confirmEmailAction(user.confirmEmailToken, em)).rejects.toThrow('USER_IS_ALREADY_CONFIRMED')
  })
  test('confirmEmailAction complete', async () => {
    expect.assertions(1)

    const user = await createBasicUser()

    await confirmEmailAction(user.confirmEmailToken, em)

    const result = await em.findOneOrFail(User, user.id)

    expect(result.emailConfirm).toBeTruthy()
  })
})
describe('AuthAction: resendEmailConfirmationAction', () => {
  test('resendEmailConfirmationAction email already confirmed', async () => {
    expect.assertions(1)

    const user = await createBasicUser()
    em.assign(user, { emailConfirm: true })
    await em.flush()

    await expect(async () => await resendEmailConfirmationAction(user.email, em)).rejects.toThrow()
  })
  test('resendEmailConfirmationAction complete', async () => {
    expect.assertions(1)

    const user = await createBasicUser()
    const token = user.confirmEmailToken
    await em.flush()

    await resendEmailConfirmationAction(user.email, em)

    const result = await em.findOneOrFail(User, user.id)

    expect(result.confirmEmailToken).not.toBe(token)
  })
})
describe('AuthAction: refreshTokenAction', () => {
  test('refreshTokenAction complete', async () => {
    expect.assertions(1)

    const user = await createBasicUser()

    user.jwtToken = 'just_a_init_value'

    await em.flush()

    await refreshTokenAction(user, em)

    const result = await em.findOneOrFail(User, user.id)

    expect(result.jwtToken).not.toBe('just_a_init_value')
  })
})
// todo in future
describe('AuthAction: confirmChangeEmailAction', () => {
  test('confirmChangeEmailAction failed verify jwt', async () => {
    expect.assertions(1)

    const user = await createBasicUser()

    await expect(async () => await confirmChangeEmailAction(user.confirmEmailToken, em)).rejects.toThrow()
  })
})
