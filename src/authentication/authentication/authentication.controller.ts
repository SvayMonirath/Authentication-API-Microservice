import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginRequest, RegisterRequest } from 'src/dto/authentication.request';
import {
  LoginResponse,
  RegisterResponse,
} from 'src/dto/authentication.response';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

const ACCESS_TOKEN_COOKIE_NAME = 'access_token';

const parseDurationToMs = (value: string | number | undefined): number => {
  if (typeof value === 'number') {
    return value * 1000;
  }

  if (!value) {
    return 60 * 60 * 1000;
  }

  const match = /^([0-9]+)([smhdwy])$/i.exec(value);
  if (!match) {
    return 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit] || multipliers.h);
};

const getCookieOptions = (configService: ConfigService): CookieOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: parseDurationToMs(
      configService.get<string | number>('JWT_EXPIRES_IN'),
    ),
  };
};

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterRequest,
  ): Promise<RegisterResponse> {
    await this.authenticationService.register(registerDto);

    return {
      status: 'success',
      message: 'User registered successfully',
    };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const access_token = await this.authenticationService.login(loginDto);

    response.cookie(
      ACCESS_TOKEN_COOKIE_NAME,
      access_token,
      getCookieOptions(this.configService),
    );

    return {
      status: 'success',
      message: 'User logged in successfully',
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(
      ACCESS_TOKEN_COOKIE_NAME,
      getCookieOptions(this.configService),
    );

    return {
      status: 'success',
      message: 'User logged out successfully',
    };
  }
}
