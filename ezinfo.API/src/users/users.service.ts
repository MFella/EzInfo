import { HttpException, Injectable } from "@nestjs/common";
//import {User} from '../user';
import { Users } from "../users";
import { InjectRepository } from "@nestjs/typeorm";
import { MongoRepository, Repository } from "typeorm";
import { User } from "./user.entity";
import { UserForCreationDto } from "./dto/user-for-creation.dto";
import * as argon2 from "argon2";
import { v4 as uuid } from "uuid";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
  ) {}

  findAll(): Promise<Array<User>> {
    return this.usersRepository.find();
  }

  public async checkIfExists(login: string) {
    try {
      const user = await this.usersRepository.findOneBy({ login });
      if (user) {
        return { available: false };
      } else return { available: true };
    } catch (e) {
      console.log(e);
      throw new HttpException("Something went wrong", 500);
    }
  }

  async create(newUser: UserForCreationDto) {
    const user = new User();
    user.login = newUser.login;
    user.name = newUser.name;
    user.surname = newUser.surname;
    user.email = newUser.email;
    user.id = uuid();

    try {
      const customHash = await argon2.hash(newUser.password);
      user.passwordHash = customHash;
    } catch (err) {
      console.warn(err);
    }

    const res = await this.usersRepository.save(user);

    const { passwordHash, id, ...result } = res;

    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email: email } });

    return user;
  }

  async findByLogin(login: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        login,
      },
    });

    return user;
  }

  async changePassword(user: User, password: string) {
    const customHash = await argon2.hash(password);
    user.passwordHash = customHash;

    return await this.usersRepository.update({ login: user.login }, user);
  }

  async ifUserExists(login: string) {
    const hipoUser = await this.usersRepository.findBy({ login: login });

    if (hipoUser.length === 0) {
      return true;
    } else return false;
  }

  async delete(id: number) {
    await this.usersRepository.delete(id);
  }
}
