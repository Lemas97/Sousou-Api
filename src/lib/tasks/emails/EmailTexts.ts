import { FRONT_PORT, FRONT_URL } from '../../../dependencies/config'
import { User } from '../../../types/entities/User'
import sendEmail from './SendEmail'

export async function confirmEmail (user: User): Promise<void> {
  await sendEmail(user.email, 'Confirm your email', `
    <p>
      <p>
        Thank you for signing up for our service. To ensure that we have the correct email address on file and to verify your account, please click on the link below to confirm your email:
      </p>
      <br>
      <a href="${FRONT_URL}/auth/confirm-email/${user.confirmEmailToken}">Confirm your email</a>
      <br>
      <p>
        Once you have confirmed your email address, you will have full access to our service and receive important updates and notifications.
      </p>
      <br>
        If you did not sign up for our service, please ignore this message.
      <br>
    </p>
  `)
}

export async function forgotPasswordMail (user: User): Promise<void> {
  await sendEmail(user.email, 'Reset Your Password', `
    <p>
      We
      <br>
      <br>
      <p>
      We have received a request to reset the password associated with your account. If you did not make this request, please ignore this message and take the necessary steps to secure your account.
      </p>
      <br>
      <p>
      To reset your password, please click on the link below:
      </p>
      <br>
      <br>
      <a href="${FRONT_URL}/auth/reset-password/${user.resetPasswordToken!}"></a>
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
