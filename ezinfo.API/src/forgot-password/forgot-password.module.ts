import { TypeOrmModule } from "@nestjs/typeorm";
import {Module} from '@nestjs/common';
import { ForgotPassword } from "./forgot-password.entity";
import { ForgotPasswordService } from "./forgot-password.service";


@Module({
    imports: [TypeOrmModule.forFeature([ForgotPassword])], 
    providers: [ForgotPasswordService]
})
export class ForgotPasswordModule{}