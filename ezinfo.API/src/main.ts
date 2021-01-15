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
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  //app.useGlobalInterceptors(new ExcludeNullInterceptor())
  const configService = app.get(ConfigService);
  app.use(cookieParser(configService.get('COOKIE_SECRET')));
  app.use(helmet());

  
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION')
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })
  // should work, but it doesnt work ;)

  //app.use(csurf({cookie: { key: 'xsrf-token', sameSite: true}})); 
  // app.use(function (req, res, next) {
  //   console.log(req.cookies._csrf);
    
  //   res.cookie('xsrf-token', req.headers['xsrf-token']);
  //   res.locals.csrftoken = req.headers['xsrf-token'];
  //   next();
  // });

  // handling csrf errors
  // app.use((err, req, res, next) =>
  // {
  //   console.log(req.headers);
  //   if (err.code !== 'EBADCSRFTOKEN') return next(err)
  //   // handle CSRF token errors here
  //   res.status(403)
  //   res.json({
  //     code : 403,
  //     msg:'invalid csrf token'
  //   })
  // });

  // app.use(function (req, res, next) {
  // console.log(req.headers);
  
  // res.cookie('xsrf-token', req.headers['xsrf-token']);
  // res.locals.csrftoken = req.headers['xsrf-token'];
  // next();

  // });
  
  // app.use((err, req, res, next) =>
  // {
  //   console.log(req.headers);
  //   if (err.code !== 'EBADCSRFTOKEN') return next(err)
  //   // handle CSRF token errors here
  //   res.status(403)
  //   res.json({
  //     code : 403,
  //     msg:'invalid csrf token'
  //   })
  // });

  app.use(limiter);
  await app.listen(process.env.PORT);
  
  app.use(csurf({cookie: true}));
  
}
bootstrap();
 