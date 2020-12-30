import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

// const configuration  = {
//   JWT_SECRET: Joi.string().required(),
//   JWT_EXPIRATION_TIME: Joi.string().required(),
//   AWS_REGION: Joi.string().required(),
//   AWS_ACCESS_KEY_ID: Joi.string().required(),
//   AWS_SECRET_ACCESS_KEY: Joi.string().required()
// };

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UsersModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DB: Joi.string().required(),
        PORT: Joi.number(),
      })
    }),
  DatabaseModule,
  AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private connection: Connection){}
} 
