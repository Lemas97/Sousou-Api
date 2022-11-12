import { FRONT_PORT, FRONT_URL } from 'src/dependencies/config'
import { User } from 'src/types/entities/User'
import sendEmail from './SendEmail'

export async function emailTexts (user: User): Promise<void> {
  await sendEmail(user.email, 'Confirm your email', `
    <p>
      Thank you for registering on our website.
      <br>
      <br>
      Please click on the following link to confirm your email:
      <br>
      <br>
      <a href="${FRONT_URL}:${FRONT_PORT}/confirm-email/${user.confirmEmailToken}">Confirm your email</a>
    </p>
  `)
}

export async function changeEmail (user: User, newEmail: string, changeEmailToken: string): Promise<void> {
  await sendEmail(user.email, 'Confirm your email', `
    <p>
      You asked to change your email address to ${newEmail}.
      <br>
      <br>
      Please click on the following link to confirm the change:
      <br>
      <br>
      <a href="${FRONT_URL}:${FRONT_PORT}/change-email/${changeEmailToken}">Confirm your email</a>
    </p>
  `)
}