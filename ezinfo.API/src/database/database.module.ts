import { Sharing } from "./../files/shared.entity";
import { Note } from "./../files/note.entity";
import { ForgotPassword } from "./../forgot-password/forgot-password.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { File } from "../files/file.entity";
import { User } from "src/users/user.entity";
import { Attempt } from "src/auth/attempt.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("MYSQL_HOST"),
        port: configService.get("MYSQL_PORT"),
        username: configService.get("MYSQL_USER"),
        password: configService.get("MYSQL_PASSWORD"),
        database: configService.get("MYSQL_DB"),
        synchronize: true, // appropriate in production
        entities: [
          // __dirname + "/../**/*.entity{.ts,.js}",
          File,
          User,
          Attempt,
          ForgotPassword,
          Note,
          Sharing,
        ],
      }),
    }),
  ],
})
export class DatabaseModule {}
