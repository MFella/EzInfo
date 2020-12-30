import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {Strategy} from 'passport-local';
import { User } from "src/user";
import { AuthService } from "./auth.service";


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    
    constructor(private authServ: AuthService){
        super({
            loginField: 'login'
        });
    }

    async validate(login: string, password: string): Promise<User> {
        const user = await this.authServ.validate(login, password);
        if(!user)
        {
            throw new UnauthorizedException();
        }
        return user;
    }

}