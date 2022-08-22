import { ForbiddenError, UserInputError, ValidationError } from 'apollo-server-koa'
import { UserPreferencesInputData } from 'src/types/classes/input-data/json-input-data/UserPreferencesInputData'
import { UserRegisterInputData } from 'src/types/classes/input-data/UserRegisterInputData'
import { User } from 'src/types/entities/User'
import { v4 } from 'uuid'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { confirmEmailOnRegister } from '../tasks/emails/RegisterEmail'
import { LoginUserInputData } from 'src/types/classes/input-data/LoginUserInputData'
import { PRIVATE_KEY } from 'src/dependencies/config'
import { EntityManager } from '@mikro-orm/core'
import { PersistedQueryNotFoundError } from 'apollo-server-errors'

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
    emailConfirm: false,
    icon: '',
    createdAt: new Date(),
    password: hash,
    code,
    displayName: data.username,
    preferences: preferences,
    // make it token with expiration
    confirmEmailToken: v4()
  })

  await em.persistAndFlush(user)

  await confirmEmailOnRegister(user)

  return user.confirmEmailToken
}

export async function loginUserAction (data: LoginUserInputData, em: EntityManager): Promise<string> {
  const user = await em.findOneOrFail(User, { email: data.email })

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

  user.jwtToken = token

  await em.flush()

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

  await confirmEmailOnRegister(user)

  return user.confirmEmailToken
}