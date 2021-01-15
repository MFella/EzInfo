import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { request } from "express";

@Injectable()
export default class JwtAuthGuard extends AuthGuard('jwt'){

    handleRequest(err: any, user: any)
    {
        if(user) 
        {
            const {passwordHash, ...rest} = user;
            return rest;
        }
        
        return null;
    }
}