import { ForbiddenError, UserInputError, ValidationError } from 'apollo-server-koa'
import { PersistedQueryNotFoundError } from 'apollo-server-errors'
import { EntityManager } from '@mikro-orm/core'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { v4 } from 'uuid'

import { UserPreferencesInputData } from '../..//types/classes/input-data/json-input-data/UserPreferencesInputData'
import { UserRegisterInputData } from '../..//types/classes/input-data/UserRegisterInputData'
import { User } from '../..//types/entities/User'
import { confirmEmail } from '../tasks/emails/EmailTexts'
import { LoginUserInputData } from '../..//types/classes/input-data/LoginUserInputData'
import { ENVIRONMENT, PRIVATE_KEY } from '../..//dependencies/config'

export async function usernameExistsAction (username: string, em: EntityManager): Promise<boolean> {
  const user = await em.findOne(User, { username })

  return !!user
}

export async function registerUserAction (data: UserRegisterInputData, em: EntityManager): Promise<string> {
  const hash = bcrypt.hashSync(data.password, 12)
  let code = Math.round(Math.random() * (9999 - 0)).toString()

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
    isLoggedIn: false,
    emailConfirm: false,
    icon: '',
    createdAt: new Date(),
    password: hash,
    lastReadMessage: '',
    code,
    displayName: data.displayName ?? '',
    preferences: preferences,
    // make it token with expiration
    confirmEmailToken: v4()
  })

  await em.persistAndFlush(user)
  await confirmEmail(user)

  return user.confirmEmailToken
}

export async function loginUserAction (data: LoginUserInputData, em: EntityManager): Promise<string> {
  const user = await em.findOneOrFail(User, {
    $or: [
      { email: data.email },
      { username: data.email }
    ]
  })

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

  em.assign(user, { jwtToken: token, isLoggedIn: true })

  await em.flush()

  // todo check socket needed

  return token
}

export async function confirmEmailAction (confirmEmailToken: string, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, { confirmEmailToken })

  if (user.emailConfirm) throw new UserInputError('USER_IS_ALREADY_CONFIRMED')

  user.emailConfirm = true

  await em.flush()

  return true
}

export async function resendEmailConfirmationAction (email: string, em: EntityManager): Promise<string> {
  const user = await em.findOneOrFail(User, { email })

  if (user.emailConfirm) throw new PersistedQueryNotFoundError()

  user.confirmEmailToken = v4()
  await em.flush()

  if (ENVIRONMENT !== 'test') await confirmEmail(user)

  return user.confirmEmailToken
}

export async function forgotPasswordAction (email: string, em: EntityManager): Promise<string> {
  const user = await em.findOneOrFail(User, { email })

  user.resetPasswordToken = v4()
  await em.flush()

  if (ENVIRONMENT !== 'test') await confirmEmail(user)

  return user.resetPasswordToken
}

export async function resetPasswordAction (resetPasswordToken: string, newPassword: string, em: EntityManager): Promise<boolean> {
  const user = await em.findOneOrFail(User, {
    $and: [
      { resetPasswordToken },
      { resetPasswordToken: { $ne: null } }

    ]
  })
  const hash = bcrypt.hashSync(newPassword, 12)

  em.assign(user, { password: hash, resetPasswordToken: null })
  await em.flush()

  return true
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

export async function confirmChangeEmailAction (changeEmailToken: string, em: EntityManager): Promise<boolean> {
  const data = jwt.verify(changeEmailToken, PRIVATE_KEY, { algorithms: ['HS256'], ignoreExpiration: true }) as { id: string, email: string, newEmail: string}

  if (!data.id || !data.email || !data.newEmail) throw new ForbiddenError('This token is not valid')

  const user = await em.findOneOrFail(User, data.id)
  em.assign(user, { email: data.newEmail })
  await em.flush()

  return true
}
