import { Body, Controller, Post, Req, UseGuards, Res, HttpCode, Response, Query, Get, UploadedFile, UseInterceptors, ValidationPipe} from "@nestjs/common";
import { Request } from 'express';
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "src/users/users.service";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import RegisterDto from "./dto/register.dto";
import JwtAuthGuard from "./jwt-auth.guard";
import { LocalAuthGuard } from "./local-auth.guard";
import { RequestCreds } from "./request-creds.interface";
import { FileInterceptor } from "@nestjs/platform-express";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authServ: AuthService,
        private readonly usersServ: UsersService
    ){}

    @Get('availability')
    async availability(@Query() query): Promise<Object> {
        return this.usersServ.checkIfExists(query.login);

    }

    @Post('register')
    async register(@Body() dataForRegister: RegisterDto)
    {
        return this.authServ.register(dataForRegister);
    }

    @Post('login')
    @HttpCode(200)
    //@UseGuards(LocalAuthGuard)
    async login(@Req() loginDto: RequestCreds) {


        console.log(loginDto.headers);
        //delay
        const sleep = (time) =>
        {
            return new Promise(res => setTimeout(res, time));
        }

        return sleep(1000).then(async() => 
        {
            return await this.authServ.login(loginDto.body);
        })
    }

    

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(200)
    async logout(@Req() request: Request)
    {
        request.res.setHeader('Set-Cookie', this.authServ.getCookiesForLogOut());
        return {res: true, msg: "You have successfully logged out"}
    }

    @UseGuards(JwtAuthGuard)
    @Get('protected')
    async protected(@Req() request: Request)
    {
        return {msg: "Thats is the protected one"};
    }


    // @Post('file/')
    // @HttpCode(200)
    // @UseInterceptors(FileInterceptor('file'))
    // async addFile(@Req() request: any, @UploadedFile() file: any)
    // {
    //     console.log(file);
    //     return {'reached': true};

    // }
    @Post('forgotPass')
    async forgotPass(@Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto): Promise<void>
    {
        

    }
}