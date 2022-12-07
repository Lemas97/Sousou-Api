import nodemailer from 'nodemailer'
import { EMAIL_ADDRESS, EMAIL_HOST, EMAIL_NAME, USER_EMAIL, USER_EMAIL_PWD } from '../../../dependencies/config'
import * as Sentry from '@sentry/node'

export default async function sendEmail (to: string, subject: string, text: string): Promise<void> {
  const testAccount = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: USER_EMAIL !== '' ? USER_EMAIL : testAccount.user, // generated ethereal user
      pass: USER_EMAIL_PWD !== '' ? USER_EMAIL_PWD : testAccount.pass // generated ethereal password
    }
  })

  transporter.sendMail({
    from: EMAIL_NAME !== '' ? `"${EMAIL_NAME}" <${EMAIL_ADDRESS}>` : testAccount.user, // sender address
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
