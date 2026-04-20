import { Injectable } from '@nestjs/common';
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
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'no_jwt_secret_in_env_variable',
    });
  }

  async validate(payload: { sub: number; username: string }) {
    const user = await this.userRepository.findUserByUsername(payload.username);
    if (!user) throw new Error('User not found');
    return user;
  }
}
