import { UsersService } from "src/users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { MysqlErrorCodes } from "../database/mysqlErrorCodes.enum";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { LoginDto } from "./dto/login.dto";
import { Attempt } from "./attempt.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MongoRepository } from "typeorm";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { MailService } from "src/mail/mail.service";
import { ForgotPasswordService } from "src/forgot-password/forgot-password.service";
import * as crypto from "crypto";
import { isUUID } from "class-validator";
import { User } from "src/user";
import { LoggedUserDto } from "./dto/loggerUser.dto";

@Injectable()
export class AuthService {
  private static readonly PASSWORD_PATTERN: RegExp = /^^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtServ: JwtService,
    private readonly configServ: ConfigService,
    @InjectRepository(Attempt)
    private attemptRepository: MongoRepository<Attempt>,
    private readonly mailService: MailService,
    private readonly forgotServ: ForgotPasswordService,
  ) {}

  public async register(dataForRegister: RegisterDto) {
    const userByEmail = await this.usersService.findByEmail(dataForRegister.email);
    const userByLogin = await this.usersService.findByLogin(dataForRegister.login);

    if (userByEmail) {
      throw new BadRequestException("User with that email already exists");
    }

    if (userByLogin) {
      throw new BadRequestException("User with that login already exists");
    }

    try {
      const createdUser = await this.usersService.create(dataForRegister);

      return createdUser;
    } catch (e: unknown) {
      if ((e as any).code === MysqlErrorCodes.ER_DUP_UNIQUE) {
        throw new HttpException("User with that email already exists!", HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("Something went wrong ;/", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async validate(login: string, password: string) {
    try {
      const user = await this.usersService.findByLogin(login);
      const verifiedPassword = await argon2.verify(user.passwordHash, password);

      if (user && verifiedPassword) {
        const { passwordHash, ...result } = user;
        return result;
      }
      return null;
    } catch (e) {
      throw new HttpException("User with that credentials doesnt exists!", 404);
    }
  }

  public async login(loginCreds: LoginDto): Promise<LoggedUserDto> {
    const res = await this.validate(loginCreds.login, loginCreds.password);

    if (res !== null) {
      const payload = { login: loginCreds.login };

      await this.attemptRepository.update({ login: loginCreds.login }, { attempt_number: 0, ban_time: "" });

      return {
        res: true,
        msg: "Successfully loggedIn",
        expiresIn: this.configServ.getOrThrow<number>("JWT_EXPIRATION_TIME"),
        access_token: this.jwtServ.sign(payload),
        user: res,
      };
    } else {
      const loginFromAttempt = await this.attemptRepository.findOne({ where: { login: loginCreds.login } });

      if (!loginFromAttempt) {
        await this.attemptRepository.save({
          login: loginCreds.login,
          attempt_number: 1,
          ban_time: "",
        });
      } else {
        loginFromAttempt.attempt_number = loginFromAttempt.attempt_number + 1;

        if (loginFromAttempt.attempt_number === 5 && loginFromAttempt.ban_time === "") {
          loginFromAttempt.ban_time = Math.floor(new Date().getTime() / 1000).toString();

          await this.attemptRepository.update({ login: loginCreds.login }, loginFromAttempt);
        } else if (loginFromAttempt.attempt_number === 6 && loginFromAttempt.ban_time !== "") {
          if (parseInt(loginFromAttempt.ban_time) + 60 < Math.floor(new Date().getTime() / 1000)) {
            await this.attemptRepository.update({ login: loginCreds.login }, { ban_time: Math.floor(new Date().getTime() / 1000).toString(), attempt_number: 1 });
          } else {
            throw new UnauthorizedException("You tried to login too many times. Try again in one minute.");
          }
        } else {
          await this.attemptRepository.update({ login: loginCreds.login }, loginFromAttempt);
        }
      }

      throw new UnauthorizedException("Cant login, inappropriate login or password");
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<boolean> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      throw new BadRequestException("Invalid email. Try again");
    }

    const payload = {
      email: forgotPasswordDto.email,
    };

    const token = this.jwtServ.sign(payload);

    try {
      const saveRes = await this.forgotServ.saveForgetness(forgotPasswordDto.email, token);

      if (saveRes[0]) {
        const frontendHostName: string = this.configServ.getOrThrow<string>("FRONTEND_HOST");
        const mailUserAddress: string = this.configServ.getOrThrow<string>("MAIL_USER");
        const link = `https://${frontendHostName}/reset?token=${saveRes[1]}`;

        const result = await this.mailService.sendMail({
          from: mailUserAddress,
          to: user.email,
          subject: "Forgot Password",
          html: `
                      <h2>Hi there, ${user.name}</h2>
                      <p>Use this <a href=${link}>link</a> to reset your password. You've got <strong>10 minutes.</strong> Good luck.</p>
                    `,
        });

        return result;
      }

      throw new HttpException("Internal error - cant send reactivation mail", 500);
    } catch (e) {
      throw new HttpException("Internal error - cant send reactivation mail", 500);
    }
  }

  async validateId(id: string) {
    const uuid = isUUID(id);

    if (!uuid) {
      // tbh -> uuid is invalid, but dont say that
      throw new UnauthorizedException("You are not allowed to do this");
    }

    const forgotOne = await this.forgotServ.findById(id);

    if (!forgotOne) {
      // tbh -> that uuid doesnt exists in db, so shame on you
      throw new UnauthorizedException("You are not allowed to do this");
    } else {
      try {
        const algorithm = "camellia-192-cbc";
        const key = crypto.scryptSync(forgotOne.id.toString(), "salt", 24);

        const decipher = crypto.createDecipheriv(algorithm, key, forgotOne.iv.buffer as Buffer);

        const stringedToken = forgotOne.tokenHash;

        const decryptedToken = decipher.update(stringedToken, "hex", "utf8") + decipher.final("utf8");

        const identity = this.jwtServ.verify(decryptedToken);

        if (identity.email !== forgotOne.email) {
          throw new BadRequestException("Emails doesnt match");
        }

        //try to find guy with that email
        const userFromDb = await this.usersService.findByEmail(identity.email);

        if (!userFromDb) {
          throw new HttpException("User doesnt exists", 404);
        }

        const payload = { login: userFromDb.login };

        const { passwordHash, ...userToReturn } = userFromDb;

        //delete token from db

        await this.forgotServ.deleteForgetness(userFromDb.email);

        return {
          res: true,
          msg: "Successfully loggedIn",
          expiresIn: this.configServ.getOrThrow("JWT_EXPIRATION_TIME"),
          access_token: this.jwtServ.sign(payload),
          user: userToReturn,
        };
      } catch (e) {
        if (e.name === "TokenExpiredError") {
          throw new HttpException("Password reset time has elapsed. Try to send remind-email again", 401);
        }

        throw new InternalServerErrorException("Error occured during checking identity");
      }
    }
  }

  async changePassword(user: User, password: string): Promise<boolean> {
    if (!AuthService.PASSWORD_PATTERN.test(password)) {
      throw new BadRequestException("Bad pattern of password");
    }

    if (!user) {
      throw new UnauthorizedException("You are not allowed to do such a thing");
    }

    try {
      const userFromDb = await this.usersService.findByLogin(user.login);

      if (!userFromDb) {
        throw new HttpException("Account with that email doesnt exist", 418);
      }

      const result = await this.usersService.changePassword(userFromDb, password);

      if (result.affected === 1) {
        return true;
      } else return false;
    } catch (e) {
      throw new InternalServerErrorException("Error occured during changing password");
    }
  }

  public getCookiesForLogOut() {
    return ["Authentication=; HttpOnly; Path=/; Max-Age=0", "Refresh=; HttpOnly; Path=/; Max-Age=0"];
  }
}
