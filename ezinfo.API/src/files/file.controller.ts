import { Controller, Get, HttpCode, Post, Req, UploadedFile, UseInterceptors, Request, Query, Delete, Body, UseGuards} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";
import { FileService } from "./file.service";
import { Express }from 'express';
import JwtAuthGuard from "src/auth/jwt-auth.guard";
import { RequestWithUser } from "src/auth/request-user.interface";


//maybe some authorization?

@Controller('file')
export class FileController{
    
    constructor(
        // private readonly authServ: AuthService,
        // private readonly usersServ: UsersService,
        private readonly fileServ: FileService                
    ){}


    @Post('upload')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@Req() request: any, @UploadedFile() file: any)
    {
        //console.log(file.originalname);
        const result = await this.fileServ.uploadFile(file, file.originalname);
        console.log('From file controller: ');
        console.log(result);

        //return await this.fileServ.uploadFile(file, file.originalname);
        return {'reached': true, 'result': result};
    }

    @Delete('')
    @HttpCode(204)
    async deleteFile(@Query() query: any)
    {
        const id = query.id;
        const res = await this.fileServ.deleteFile(id);

        return res;
    }

    @Get('')
    @HttpCode(200)
    async getFile(@Query() query: any)
    {

        console.log(query);
        return this.fileServ.getObject(query.key);
    }

    @Post('save')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async saveText(@Req() request: RequestWithUser) //requestWithUser
    {

        console.log(request.user);
        return this.fileServ.saveText(request.body, request.user);
    }


}