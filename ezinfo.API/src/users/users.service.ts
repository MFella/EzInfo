import { Injectable } from '@nestjs/common';
import { exception } from 'console';
//import {User} from '../user';
import {Users} from '../users';
import {InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {User} from './user.entity';
import {UserForCreationDto} from './dto/user-for-creation.dto';
import * as argon2 from 'argon2';

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

    async create(newUser: UserForCreationDto)
    {
        const user = new User();
        user.login = newUser.login;
        user.name = newUser.name;
        user.surname = newUser.surname;
        try{
            const customHash = await argon2.hash(newUser.password);
            user.passwordHash = customHash;
            console.log(`Hashed password: ${customHash}`);

        }catch(err)
        {
            console.log(err);
        }

        return await this.usersRepository.save(user);
    }

    async findOne(id: number): Promise<User> {

        // const user:User = this.users[id];

        // if(!user) throw new Error('No user found ;/.');

        // return user;
        const user = await this.usersRepository.findOne(id);
        console.log(user);
        try{
            //the way of retriving hash from blob
            const convert = Buffer.from(user.passwordHash, 'base64').toString('utf-8');

            if(await argon2.verify(convert, "kaczorek99"))
            {
                console.log("No tak, to sie zgadza");
            }
            else{
                console.log("Lipa")
            }

        }catch(e)
        {
            console.log(`error occured: ${e}`);
        }

        
        return await this.usersRepository.findOne(id);
    }

    async ifUserExists(login: string)
    {
        const hipoUser = await this.usersRepository.find({login: login});
        console.log(hipoUser);

        if(hipoUser.length === 0)
        {
            return true;
        }else return false;

    }


    // async registerUser(user: UserForCreationDto)
    // {
    //     if(await this.usersRepository.find({login: user.login}))

    // }

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
