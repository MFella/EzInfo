import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Mailgun from "mailgun-js";

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService, private readonly mailerService: MailerService) {}

  sendMail(sendMailOptions: ISendMailOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mailerService.sendMail(sendMailOptions).then(
        res => {
          resolve(true);
        },
        err => {
          reject(false);
          console.log(err);
        },
      );
    });
  }
}
