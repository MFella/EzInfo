import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstans } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Attempt } from './attempt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordService } from 'src/forgot-password/forgot-password.service';
import { ForgotPasswordModule } from 'src/forgot-password/forgot-password.module';
import { ForgotPassword } from 'src/forgot-password/forgot-password.entity';
import { PassportModule } from '@nestjs/passport';
import { Module } from '@nestjs/common/decorators';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    MailModule,
    ForgotPasswordModule,
    TypeOrmModule.forFeature([Attempt, ForgotPassword]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: jwtConstans.secret,
        signOptions: {
          expiresIn: `${jwtConstans.expiresIn}s`,
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    UsersService,
    JwtStrategy,
    MailService,
    ForgotPasswordService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
