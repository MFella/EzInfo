import { User } from "src/user";

export interface RequestWithUser extends Request
{
    user: User
}