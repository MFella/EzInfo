import {IsString, IsNumber, IsOptional} from 'class-validator';

export class User {
    @IsNumber() @IsOptional() readonly id: number
    @IsString() readonly login: string
    // readonly passwordHash: Blob
    // readonly passwordSalt: Blob
    @IsString() readonly name: string
    @IsString() readonly surname: string
    @IsString() @IsOptional() readonly email: string
}
  