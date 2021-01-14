import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import {ValidationPipe} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config } from 'aws-sdk';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as csurf from 'csurf';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

dotenv.config()

async function bootstrap() {

  const httpsOptions = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions
  });

  app.useGlobalPipes(new ValidationPipe());
  //app.useGlobalInterceptors(new ExcludeNullInterceptor())
  app.use(cookieParser());
  
  app.enableCors();
  app.use(helmet());

  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION')
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })

  app.use(limiter);
  await app.listen(process.env.PORT);
  app.use(csurf());
}
bootstrap();
 