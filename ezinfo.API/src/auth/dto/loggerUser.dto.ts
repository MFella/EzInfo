import { IsBoolean, IsNotEmpty, IsNotIn, IsNumber, IsString } from "class-validator";
import { User } from "src/user";

export class LoggedUserDto {
  @IsBoolean()
  res: true;

  @IsString()
  @IsNotEmpty()
  msg: string;

  @IsNumber()
  @IsNotIn([0])
  @IsNotEmpty()
  expiresIn: number;

  @IsString()
  @IsNotEmpty()
  access_token: string;
  user: User;
}
