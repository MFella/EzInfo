import { UsersService } from "src/users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { BadRequestException, HttpCode, HttpException, HttpStatus, Injectable, UnauthorizedException, UseGuards } from "@nestjs/common";
import {MysqlErrorCodes} from '../database/mysqlErrorCodes.enum';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Payload } from "./payload.interface";
import * as argon2 from "argon2";
import { LoginDto } from "./dto/login.dto";
import { jwtConstans } from "./constants";
import { Attempt } from "./attempt.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { MailService } from "src/mail/mail.service";
import { ForgotPasswordService } from "src/forgot-password/forgot-password.service";
import { HttpResponse } from "aws-sdk";

@Injectable()
export class AuthService{

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtServ: JwtService,
        private readonly configServ: ConfigService,
        @InjectRepository(Attempt)
        private attemptRepository: Repository<Attempt>,
        private readonly mailService: MailService,
        private readonly forgotServ: ForgotPasswordService
        ){}


    public async register(dataForRegister: RegisterDto)
    {
        //const hashedPass = await argon2.hash(dataForRegister.password);

        try{
            const createdUser = await this.usersService.create(dataForRegister);

            return createdUser;

        }catch(e)
        {
            console.log(e);

            if(e?.code === MysqlErrorCodes.ER_DUP_UNIQUE)
            {
                throw new HttpException('User with that email already exists!', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Something went wrong ;/', HttpStatus.INTERNAL_SERVER_ERROR);
            
        }
    };

    public async validate(login: string, password: string)
    {
        const user = await this.usersService.findByLogin(login);

        try{
            const convert = Buffer.from(user.passwordHash, 'base64').toString('utf-8');
            const verifiedPassword = await argon2.verify(convert, password);
            //console.log(`Verified password? ${verifiedPassword}`);

            if(user && verifiedPassword)
            {
                const {passwordHash, ...result} = user;
                return result;
            }
            return null;
        }
        catch(e)
        {
          throw new HttpException('User with that credentials doesnt exists!', 404);
          //return null
        }

    }
 
    public async login(loginCreds: LoginDto)
    {

      const res = await this.validate(loginCreds.login, loginCreds.password);

        if(res !== null)
        {
          const payload = {login: loginCreds.login};

          await this.attemptRepository.update({login: loginCreds.login}, {attempt_number: 0, ban_time: ''})

          return {
              res: true,
              msg: 'Successfully loggedIn',
              expiresIn: jwtConstans.expiresIn,
              access_token: this.jwtServ.sign(payload),
              user: res
          }
        }else 
        {
          const loginFromAttempt = await this.attemptRepository.findOne({where: {login: loginCreds.login}});

          if(!loginFromAttempt)
          {  

            await this.attemptRepository.save({
              login: loginCreds.login,
              attempt_number: 1,
              ban_time: ''
            });

          }else
          {

            loginFromAttempt.attempt_number = loginFromAttempt.attempt_number + 1;

            if(loginFromAttempt.attempt_number === 5 && loginFromAttempt.ban_time === '')
            {
              loginFromAttempt.ban_time = Math.floor(new Date().getTime() / 1000).toString();

              await this.attemptRepository.update({login: loginCreds.login}, loginFromAttempt)

            }else if (loginFromAttempt.attempt_number === 6 && loginFromAttempt.ban_time !== '')
            {

              if(parseInt(loginFromAttempt.ban_time) + 60 < Math.floor(new Date().getTime()/1000))
              {
                await this.attemptRepository
                .update({login: loginCreds.login}, 
                  {ban_time: Math.floor(new Date().getTime()/1000).toString(), attempt_number: 1});
              } else
              {
                throw new UnauthorizedException('You tried to login too many times. Try again in one minute.');
              }
 
            } else
            {
              await this.attemptRepository.update({login: loginCreds.login}, loginFromAttempt);
            }  

          }

          throw new UnauthorizedException('Cant login, inappropriate login or password');
        }

    }


    async forgotPassword(forgotPasswordDto: ForgotPasswordDto)
    {
        const user = await this.usersService.findByEmail(forgotPasswordDto.email);

        if(!user)
        {
          throw new BadRequestException('Invalid email. Try again');
        }

        const payload = {
          email: forgotPasswordDto.email
        };

        const token = this.jwtServ.sign(payload);
        //store token in database?
        // encrypt token

            try{

              const saveRes = await this.forgotServ.saveForgetness(forgotPasswordDto.email, token);
              console.log(saveRes);

                if(saveRes[0])
                {
                  const link = `http://localhost:3000/auth/confirm?token=${saveRes[1]}`;
                  // const xd = await this.mailService.sendMail({
                  //   from: this.configServ.get<string>('SERIOUS_EMAIL'),
                  //   to: user.email,
                  //   subject: 'Forgot Password',
                  //   html: `
                  //     <h2>Hi there, ${user.name}</h2>
                  //     <p>Use this <a href=${link}>link</a> to reset your password.</p>
                  //   ` 
                  // });

                  return true;
                  
                }else 
                {
                  console.log(1);

                  throw new HttpException('Internal error', 500);
                }


            }catch(e)
            {
              console.log(2);
              throw new HttpException('Internal error', 500);
            }
    }


    private async verifyToken(token): Promise<any> {

      const data = this.jwtServ.verify(token);
      //check in db if token exists
      // const existence = await this.forgotService.existence(data._id);

      //if(existence)
      //{

      //return data
    //  }
      //throw UnauthorizedException();
      
    }

    // private delay(time)
    // {
    //   return new Promise(resolve => setTimeout(resolve, time));
    // }


    //public async login(dataForLogin: LoginDto)
    // public getCookieWithJwtAccessToken(login: string) {
    //     const payload: Payload = { login };
    //     const token = this.jwtServ.sign(payload, {
    //       secret: this.configServ.get('JWT_ACCESS_TOKEN_SECRET'),
    //       expiresIn: `${this.configServ.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
    //     });
    //     return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configServ.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
    //   }

      public getCookieWithJwtRefreshToken(login: string) {
        const payload: Payload = { login };
        const token = this.jwtServ.sign(payload, {
          secret: this.configServ.get('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: `${this.configServ.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`
        });
        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configServ.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;
        return {
          cookie,
          token
        }
      }

    public getCookieWithJwtToken(login: string) {
        const payload = { login };
        const token = this.jwtServ.sign(payload);
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configServ.get('JWT_EXPIRATION_TIME')}`;
    }
    
      public getCookiesForLogOut() {
        return [
          'Authentication=; HttpOnly; Path=/; Max-Age=0',
          'Refresh=; HttpOnly; Path=/; Max-Age=0'
        ];
      }
}