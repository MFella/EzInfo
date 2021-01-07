import { Controller, Get, HttpCode, Post, Req, UploadedFile, UseInterceptors, Request, Query, Delete, Body, UseGuards} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileService } from "./file.service";
import JwtAuthGuard from "src/auth/jwt-auth.guard";
import { RequestWithUser } from "src/auth/request-user.interface";
import {RealIP} from 'nestjs-real-ip';



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
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@Req() request: RequestWithUser, @UploadedFile() file: any)
    {
        const result = await this.fileServ.uploadFile(file, file.originalname, request.user, request.body);

        //return await this.fileServ.uploadFile(file, file.originalname);
        return {'reached': true, 'result': result};
    }


    @Get('files')
    @UseGuards(JwtAuthGuard)
    async retrieveAllFiles(@Req() request: RequestWithUser, @RealIP() ip: string)
    {
        console.log("____________________");
        //console.log(request?.connection.remoteAddress);
        console.log("____________________");
        //console.log(request?.ip);
        console.log("____________________");
        console.log(request.destination);

        //TODO -> detect id, and catch number of 'trying' requesting ;)
        
        console.log(ip);


        return this.fileServ.retrieveAllFiles(request.user);
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
        return this.fileServ.getObject(query.key);
    }

    @Post('save')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async saveText(@Req() request: RequestWithUser) //requestWithUser
    {
        return this.fileServ.saveText(request.body, request.user);
    }

    @Get('note')
    @UseGuards(JwtAuthGuard)
    async retrieveNote(@Query() query: any, @Req() request: RequestWithUser)
    {
        return this.fileServ.retrieveNote(query.id, query.password, request.user);
    }

    @Get('notes')
    @UseGuards(JwtAuthGuard)
    async retrieveAllNotes(@Query() query: any, @Req() request: RequestWithUser)
    {
        return this.fileServ.retrieveAllNotes(request.user);
    }

}