import { IsString, IsNotEmpty, MinLength} from "class-validator";

export class LoginDto{

    @IsString()
    @IsNotEmpty()
    login: string;


    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    password: string;

}