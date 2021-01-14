import { User } from "src/user";

 export interface RequestWithPassword extends Request
  {
    password: string;
    user: User;
 }