import { IsNotEmpty, IsString } from "class-validator";

export class DeleteItemQuery {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
