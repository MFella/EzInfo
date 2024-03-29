import { InternalServerErrorException } from "@nestjs/common";
import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "../user";
import { Users } from "../users";
import { UserForCreationDto } from "./dto/user-for-creation.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly userServ: UsersService) {}

  @Get()
  async index(): Promise<Users> {
    return this.userServ.findAll();
  }

  @Get(":id")
  async find(@Param("login") login: string): Promise<User> {
    return this.userServ.findByLogin(login);
  }

  @Post()
  create(@Body() user: UserForCreationDto) {
    this.userServ.create(user);
  }

  @Get("/exists/:login")
  async ifUserExists(@Param("login") login: string): Promise<boolean> {
    return this.userServ.ifUserExists(login);
  }

  @Put()
  update(@Body() user: User) {
    throw new InternalServerErrorException("Not implemented yet");
  }

  @Delete(":id")
  delete(@Param("id") id: number) {
    this.userServ.delete(id);
  }
}
