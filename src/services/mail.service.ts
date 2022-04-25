import nodemailer from "nodemailer";
import MailMessage from "../interfaces/mail-message.interface";

export default class MailService {
    private transporter: nodemailer.Transporter

    constructor() {
        this.transporter = this.createMailTransporter()
        this.transporter.verify(function (error) {
            if (error) {
                console.log(error);
            }
        });
    }

    public sendMail = async (message: MailMessage) => {
        await this.transporter.sendMail(message, (err, info) => console.log(err || info))
    }

    public createMailTransporter(): nodemailer.Transporter {
        return nodemailer.createTransport(MailService.mailConfig())
    }

    private static mailConfig(): { port: any; auth: { pass: any; user: any }; host: any } {
        return {
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        }
    }
}
