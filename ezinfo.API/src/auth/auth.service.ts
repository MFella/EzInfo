import { UsersService } from "src/users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { HttpCode, HttpException, HttpStatus, Injectable, UseGuards } from "@nestjs/common";
import {MysqlErrorCodes} from '../database/mysqlErrorCodes.enum';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Payload } from "./payload.interface";
import * as argon2 from "argon2";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService{

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtServ: JwtService,
        private readonly configServ: ConfigService
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
            return null
        }
    }
 
    public async login(loginCreds: LoginDto)
    {

      const res = await this.validate(loginCreds.login, loginCreds.password);
      //const res = await this.usersService.findAll();
      if(res !== null)
      {
        const payload = {login: loginCreds.login};

        return {
            res: true,
            access_token: this.jwtServ.sign(payload)
        }
      }
    }


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