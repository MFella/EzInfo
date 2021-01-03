import { Controller, Get, HttpCode, Post, Req, UploadedFile, UseInterceptors, Request, Query} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";
import { FileService } from "./file.service";
import { Express }from 'express';


//maybe some authorization?

@Controller('file')
export class FileController{
    
    constructor(
        // private readonly authServ: AuthService,
        // private readonly usersServ: UsersService,
        private readonly fileServ: FileService                
    ){}


    @Post('')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@Req() request: any, @UploadedFile() file: any)
    {
        //console.log(file.originalname);
        this.fileServ.uploadFile(file, file.originalname)

        return {'reached': true};

    }

    @Get('')
    @HttpCode(200)
    async getFile(@Query() query: any)
    {

        console.log(query);
        return this.fileServ.getObject(query.key);

    }


}