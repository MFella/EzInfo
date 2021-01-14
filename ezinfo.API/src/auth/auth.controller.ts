import { Body, Controller, Post, Req, UseGuards, Res, HttpCode, Query, Get, UploadedFile, UseInterceptors, ValidationPipe, Redirect} from "@nestjs/common";
import { Request, Response } from 'express';

import { UsersService } from "src/users/users.service";
import { AuthService } from "./auth.service";
import RegisterDto from "./dto/register.dto";
import JwtAuthGuard from "./jwt-auth.guard";
import { RequestCreds } from "./request-creds.interface";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { RequestWithPassword } from "./request-password.interface";
import { RequestWithUser } from "./request-user.interface";

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
    @HttpCode(201)
    async forgotPass(@Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto, @Res() response: Response): Promise<void>
    {
        const res = await this.authServ.forgotPassword(forgotPasswordDto);
        if(res)
        {
            response.json({msg: 'Check your mailbox. There you will find activation link'});
            response.status(201).send();
            
        }
    }

    @Get('confirm')
    //@Redirect('https://localhost:4200', 302)
    async confirmPassword(@Query() query: any, @Res() response: Response): Promise<void>
    {
       // console.log(query);
        const tokened = await this.authServ.validateId(query.token);

        console.log(tokened);
        response.json({token: tokened});
        response.send();

        //return await this.authServ.validateId(query.token);
    }

    @Post('change')
    @UseGuards(JwtAuthGuard)
    async changePassword(@Req() requestWithUser: RequestWithUser, @Body() body, @Res() response: Response)
    {
        const change = this.authServ.changePassword(requestWithUser.user, body.password);
        
        if(change)
        {
            response.json({res: 'Your password has been changed'});
            response.status(201);
            response.send();

        }else{

            response.json({res: 'Cant change password'});
            response.status(200);
            response.send();
        }

    }
}