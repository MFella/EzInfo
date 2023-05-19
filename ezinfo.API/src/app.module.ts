import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Connection } from "typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import * as Joi from "@hapi/joi";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { FileModule } from "./files/file.module";
import { ForgotPasswordModule } from "./forgot-password/forgot-password.module";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGODB_HOST: Joi.string().required(),
        MONGODB_PORT: Joi.number().required(),
        MONGODB_USER: Joi.string().required(),
        MONGODB_PASSWORD: Joi.string().required(),
        MONGODB_DB: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        PORT: Joi.number(),
        AWS_PUBLIC_BUCKET_NAME: Joi.string().required(),
      }),
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
    }),
    DatabaseModule,
    AuthModule,
    FileModule,
    ForgotPasswordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
