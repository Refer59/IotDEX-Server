import nodemailer from 'nodemailer'
import pug from 'pug'
import * as htmlToText from 'html-to-text'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type optionsType = {
  email: string,
  subject: string,
  message: string
}

type userObject = {
  email: any
  name: any
}

class Email {
  to: string
  firstName: string
  url: string
  from: string

  constructor(user: userObject, url: string) {
    this.to = user.email,
      this.firstName = user.name.split(' ')[0],
      this.url = url,
      this.from = 'Didcom IotDEX <noreply.iotdex@didcom.com.mx>'
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production')
      return nodemailer.createTransport({
        service: 'Sendgrid',
        //secure: true,
        auth: {
          user: process.env.EMAILSERVICE_USER,
          pass: process.env.EMAILSERVICE_PASSWORD
        }
      })

    return nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "ccafe2691f7ab2",
        pass: "68a4e0b2f83406"
      }
    })
  }

  //Enviar el email
  async send(template: string, subject) {
    // 1) Renderizar HTML basado en una plantilla
    const html = pug.renderFile(`${__dirname}/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    // 2) Definir opciones de correo
    const MailOptions = {
      from: process.env.NODE_ENV === 'production' ? 'iotdex.sender@gmail.com' : this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html)
    }

    // 3) Crear un transport y enviar el email
    await this.newTransport().sendMail(MailOptions)
  }

  async sendWelcome() {
    await this.send('welcome', 'Bienvenido a la plataforma IotDEX')
  }

  async sendPasswordForgot() {
    await this.send('passwordForgot', 'Solicitud de cambio de contraseña IotDEX')
  }
}

export default Email