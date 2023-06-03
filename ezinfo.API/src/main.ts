import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
import * as fs from "fs";
import * as csurf from "csurf";
import * as helmet from "helmet";
import * as rateLimit from "express-rate-limit";

dotenv.config();

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync("./ssl/key.pem"),
    cert: fs.readFileSync("./ssl/cert.pem"),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  app.enableCors({
    origin: ["https://localhost:4201", "https://localhost:4200"],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);

  app.use(cookieParser(configService.get("COOKIE_SECRET")));

  app.use(helmet());

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        // scriptSrc: ["'self'", "example.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
      reportOnly: true,
    }),
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  });

  app.use(limiter);

  app.use(
    csurf({
      cookie: true,
      ignoreMethods: ["GET"],
      value: req => {
        return req.cookies["XSRF-TOKEN"];
      },
    }),
  );

  app.use((err, req, res, next) => {
    if (req.headers["xsrf-token"] === req.cookies["XSRF-TOKEN"]) return next();

    if (err.code !== "EBADCSRFTOKEN") return next(err);
    // handle CSRF token errors here
    res.status(403);
    res.json({
      code: 403,
      msg: "invalid csrf token",
    });
  });

  await app.listen(configService.getOrThrow<string>("BACKEND_PORT"));
}
bootstrap();
