import { Injectable } from '@nestjs/common';
import { exception } from 'console';
//import {User} from '../user';
import {Users} from '../users';
import {InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {User} from './user.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ){}

    private readonly users: Users = {
        1:{
            id: 1,
            login: "Czarek",
            name: "Czarek",
            surname: "Surname"
        },
        2:{
            id: 2,
            login: "Marek",
            name: "Zegare",
            surname: "Hahaha"
        },

    };
 
    findAll(): Promise<Array<User>>{
        return this.usersRepository.find();
    }

    create(newUser: User)
    {
        const id = Date.now();
        this.users[id] = {...newUser, id};
    }

    findOne(id: number): Promise<User> {

        // const user:User = this.users[id];

        // if(!user) throw new Error('No user found ;/.');

        // return user;

        return this.usersRepository.findOne(id);
    }

    // update(user: User)
    // {
    //     if(!this.users[user.id]) throw new Error('No user found ;c');

    //     this.users[user.id] = user;
    // }

    async delete(id: number) {
        // const user: User = this.users[id];
        // if(!user) throw new Error('No user found');

        // delete this.users[id];

        await this.usersRepository.delete(id);
    }


}
