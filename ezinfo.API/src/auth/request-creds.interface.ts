import { LoginDto } from "./dto/login.dto";
import { Request } from 'express';

export interface RequestCreds extends Request{
    loginCreds: LoginDto
}