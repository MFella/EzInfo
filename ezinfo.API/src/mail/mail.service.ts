import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Mailgun from 'mailgun-js';

@Injectable()
export class MailService {

    private mailgun: Mailgun.Mailgun;

    constructor(private readonly configService: ConfigService){  
        this.mailgun = Mailgun({
            apiKey: this.configService.get<string>('MAILGUN_API_KEY'),
            domain: this.configService.get<string>('MAILGUN_API_DOMAIN')
        })
     }

     sendMail(data: any): Promise<Mailgun.messages.SendResponse>
     {
         return new Promise((res, rej) =>
         {
             this.mailgun.messages().send(data, (err, body) =>
             {
                 if(err) rej(err);
                 
                 res(body);
             })
         });
     }

}
