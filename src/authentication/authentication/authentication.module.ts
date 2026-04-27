import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PasswordService } from '../password/password/password.service';
import { UserRepository } from 'src/repository/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'no_jwt_secret_in_env_variable',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1h') as
            | `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`
            | number,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthenticationService, PasswordService, UserRepository],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
