import { Controller, Get, HttpCode, Post, Req, UploadedFile, UseInterceptors, Request, Query, Delete, Body, UseGuards, Res} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileService } from "./file.service";
import JwtAuthGuard from "src/auth/jwt-auth.guard";
import { RequestWithUser } from "src/auth/request-user.interface";
import {RealIP} from 'nestjs-real-ip';
import {Response} from 'express';



//maybe some authorization?

@Controller('file')
export class FileController{
    
    constructor(
        // private readonly authServ: AuthService,
        // private readonly usersServ: UsersService,
        private readonly fileServ: FileService                
    ){}


    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(JwtAuthGuard)
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

    @Get('download')
    @UseGuards(JwtAuthGuard)
    async downloadFile(@Query() query: any, @Req() request: RequestWithUser, @Res() res: Response)
    {
        const file = await this.fileServ.downloadFile(query.id, query.password, request.user, res); //.pipe(res);

        return file.pipe(res);
        //console.log(file);
        //res.attachment(file);
        //file.pipe(res);
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