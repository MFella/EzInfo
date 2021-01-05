import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import {File} from '../files/file.entity';
import { Note } from './note.entity';


@Module({
    imports: [
        UsersModule, 
        TypeOrmModule.forFeature([File, Note])
    ],
    providers: [
        // AuthService, 
        // UsersService, 
        // JwtService, 
        ConfigService,
        FileService
    ],
    controllers: [FileController]
})
export class FileModule{}