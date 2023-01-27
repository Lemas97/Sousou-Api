import nodemailer from 'nodemailer'
import { EMAIL_HOST, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_USERNAME } from '../../../dependencies/config'
import * as Sentry from '@sentry/node'

export default async function sendEmail (to: string, subject: string, text: string): Promise<void> {
  const testAccount = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: EMAIL_USERNAME !== '' ? EMAIL_USERNAME : testAccount.user, // generated ethereal user
      pass: EMAIL_PASSWORD !== '' ? EMAIL_PASSWORD : testAccount.pass // generated ethereal password
    }
  })

  transporter.sendMail({
    from: EMAIL_USERNAME !== '' ? `"${EMAIL_USERNAME}" <${EMAIL_USERNAME}>` : testAccount.user, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html:
      `
        ${text}
        </br>
        </br>
      ` // html body
  }, (error, info) => {
    if (!error) {
      console.log(nodemailer.getTestMessageUrl(info))
      return
    }
    console.log(error)
    Sentry.captureException(error)
  })
}
