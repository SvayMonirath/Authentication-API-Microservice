import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/repository/user.repository';
import { Request } from 'express';

const cookieExtractor = (req: Request | undefined): string | null => {
  const cookieHeader = req?.headers?.cookie;

  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'no_jwt_secret_in_env_variable',
    });
  }

  async validate(payload: {
    sub?: string | number;
    userId?: string | number;
    username?: string;
  }) {
    const userId = payload.userId ?? payload.sub;

    if (!userId) {
      throw new UnauthorizedException(
        'Invalid token: userId not found in token',
      );
    }

    const user = await this.userRepository.findUserById(String(userId));
    if (!user) {
      throw new UnauthorizedException('Invalid token: user not found');
    }

    return user;
  }
}
