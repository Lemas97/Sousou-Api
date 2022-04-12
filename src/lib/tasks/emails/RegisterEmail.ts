import { User } from 'src/types/entities/User'
import sendEmail from './SendEmail'

export async function confirmEmailOnRegister (user: User): Promise<void> {
  await sendEmail(user.email, 'Confirm your email', `
    <p>
      Thank you for registering on our website.
      <br>
      <br>
      Please click on the following link to confirm your email:
      <br>
      <br>
      <a href="${process.env.NODE_ENV === 'production' ? 'https://www.example.com' : 'http://localhost:3000'}/confirm/${user.confirmEmailToken}">Confirm your email</a>
    </p>
  `)
}
