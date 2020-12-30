import { PassportModule } from "@nestjs/passport";
import { HttpModule, Module } from '@nestjs/common';
import { UsersModule } from "src/users/users.module";
import { LocalStrategy } from "./local.strategy";
import {AuthService} from './auth.service';
import { AuthController } from "./auth.controller";
import { UsersService } from "src/users/users.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { jwtConstans } from "./constants";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        UsersModule, 
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async(configService: ConfigService) => ({
                secret: jwtConstans.secret,
                signOptions: {
                    expiresIn: `${jwtConstans.expiresIn}s`,
                }
            }),
        })
    ],
    providers: [AuthService, LocalStrategy, UsersService, JwtStrategy],
    //exports: [AuthService],
    controllers: [AuthController]
})
export class AuthModule {}