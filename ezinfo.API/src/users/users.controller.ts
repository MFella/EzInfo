import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import {UsersService} from './users.service';
import {User} from '../user';
import {Users} from '../users';

@Controller('users')
export class UsersController {

    constructor(private readonly userServ: UsersService){}

    @Get()
    async index(): Promise<Users>{

        return this.userServ.findAll();
    }

    @Get(':id')
    async find(@Param('id') id: number): Promise<User>
    {
        return this.userServ.find(id);
    }

    @Post()
    create(@Body() user: User)
    {
        this.userServ.create(user);
    }

    @Put()
    update(@Body() user: User)
    {
        this.userServ.update(user);
    }

    @Delete(':id')
    delete(@Param('id') id: number)
    {
        this.userServ.delete(id);
    }

}
