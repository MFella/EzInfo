import {Module} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
    imports: [],
    providers: [MailService, ConfigService],
    exports: []
})
export class MailModule {}