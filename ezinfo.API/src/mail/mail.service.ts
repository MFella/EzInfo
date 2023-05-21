import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  sendMail(sendMailOptions: ISendMailOptions): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.mailerService.sendMail(sendMailOptions).then(
        res => {
          resolve(true);
        },
        err => {
          reject(false);
        },
      );
    });
  }
}
