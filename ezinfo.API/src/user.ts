import { ObjectId } from "typeorm";
import { IsString, IsNumber, IsOptional } from "class-validator";

export class User {
  @IsNumber() @IsOptional() readonly id: ObjectId;
  @IsString() readonly login: string;
  @IsString() readonly name: string;
  @IsString() readonly surname: string;
  @IsString() @IsOptional() readonly email: string;
}
