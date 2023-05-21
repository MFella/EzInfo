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
        type: "mongodb",
        host: configService.get("MONGODB_HOST"),
        port: configService.get("MONGODB_PORT"),
        username: configService.get("MONGODB_USER"),
        password: configService.get("MONGODB_PASSWORD"),
        database: configService.get("MONGODB_DB"),
        synchronize: true,
        autoLoadEntities: true,
        entities: [File, User, Attempt, ForgotPassword, Note, Sharing],
      }),
    }),
  ],
})
export class DatabaseModule {}
