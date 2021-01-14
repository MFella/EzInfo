import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Mailgun from 'mailgun-js';
import * as Sendgrid from '@sendgrid/mail';

@Injectable()
export class MailService {

    private sendgrid: Sendgrid.MailService;

    constructor(private readonly configService: ConfigService){  
        Sendgrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'))
        //Sendgrid.setApiKey('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')
     }
 
     sendMail(data: any): Promise<any>
     {
         return new Promise((resolve, reject) =>
         {  
            Sendgrid.send(data)
            .then((res) =>
            {
                console.log(res);
                resolve(true);
                console.log('Email has been sent');
            }, err =>
            {
                console.log("I jest lipa");
                reject(false);
                console.error(err.response.body.errors);
            })
         })

            
     }

}
