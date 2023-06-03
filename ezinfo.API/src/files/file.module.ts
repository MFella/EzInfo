import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "src/users/users.module";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";
import { File } from "../files/file.entity";
import { Note } from "./note.entity";
import { Sharing } from "./shared.entity";

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([File, Note, Sharing])],
  providers: [ConfigService, FileService],
  controllers: [FileController],
})
export class FileModule {}
