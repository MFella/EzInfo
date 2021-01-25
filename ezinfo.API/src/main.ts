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
  

  const app = await NestFactory.create(AppModule, 
    {
    httpsOptions
    }
  );
  app.enableCors({
    origin: ["https://localhost:4201", "https://localhost:4200"],
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe());

  //app.useGlobalInterceptors(new ExcludeNullInterceptor())

  const configService = app.get(ConfigService);

  app.use(cookieParser(configService.get('COOKIE_SECRET')));

  app.use(helmet());

  app.use(
    helmet.contentSecurityPolicy({
     directives: {
       defaultSrc: ["'self'"],
       // scriptSrc: ["'self'", "example.com"],
       objectSrc: ["'none'"],
       upgradeInsecureRequests: [],
      },
      reportOnly: true
    })
  );

  
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

  //app.use(csurf({cookie: { key: 'xsrf-token', sameSite: false}})); 
  //app.use(csurf({cookie: true}))
  // app.use(session({
  //   secret: configService.get('COOKIE_SECRET'),
  //   resave: false,
  //   saveUninitialized: false
  // }))
  app.use(csurf({cookie: true
  //   {
  //   key: 'xsrf-token',
  //   path: '/',
  //   httpOnly: true,
  //   secure: true,
  //   signed: true,
  //   sameSite: false,
  //   domain: 'https://localhost:4200',
  //   maxAge: 24*60*60*1000  //24h
  // },
  // ignoreMethods: ['GET'],
  // value: (req) =>
  // {
  //   return req.cookies['XSRF-TOKEN'];
  // }
}));

  // app.use((req, res, next) =>
  // {
  //   const csrfTokenToFront = req.csrfToken();
  //   res.locals.token = csrfTokenToFront
  //   console.log('Wchode tutaj?');
  //   res.cookie('XSRF-TOKEN', csrfTokenToFront);
  //   next();

  // })

  // app.use((err, req, res, next) =>
  // {
  //   res.setHeader('Access-Control-Allow-Credentials', 'true');
  //   console.log(req.cookies)
  //   next();
  // })
  
  app.use(limiter);

  app.use((err, req, res, next) =>
  {
    
    if(req.headers['xsrf-token'] === req.cookies['XSRF-TOKEN']) return next()

    //return next();

    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    // handle CSRF token errors here 
    res.status(403)
    res.json({
      code : 403,
      msg:'invalid csrf token'
    })
  });

  await app.listen(process.env.PORT);
  
}
bootstrap();