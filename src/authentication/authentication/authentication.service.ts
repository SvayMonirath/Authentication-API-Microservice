import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginRequest, RegisterRequest } from 'src/dto/authentication.request';
import { UserRepository } from 'src/repository/user.repository';
import { PasswordService } from '../password/password/password.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(
    private userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterRequest) {
    if (await this.userRepository.findUserByEmail(registerDto.email)) {
      throw new BadRequestException('Email already exists');
    }
    if (await this.userRepository.findUserByUsername(registerDto.username)) {
      throw new BadRequestException('Username already exists');
    }

    if (registerDto.password !== registerDto.confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    registerDto.password = await this.passwordService.hashPassword(
      registerDto.password,
    );

    await this.userRepository.createUser(registerDto);
  }

  async login(loginDto: LoginRequest) {
    const user = await this.userRepository.findUserByUsername(
      loginDto.username,
    );

    if (!user) {
      throw new BadRequestException('Invalid username or password');
    }

    await this.passwordService.validatePassword(
      loginDto.password,
      user.password,
    );

    // Keep both `sub` and `userId` for compatibility with services that expect either claim.
    const payload = { sub: user.id, userId: user.id, username: user.username };

    return this.jwtService.sign(payload);
  }
}
