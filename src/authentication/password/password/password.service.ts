import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = Number(
      this.configService.get<number>('PASSWORD_SALT_ROUNDS') || 10,
    );
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(
    input_password: string,
    storedPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(input_password, storedPassword);
    if (!isMatch) {
      throw new BadRequestException('Invalid username or password');
    }
    return isMatch;
  }
}
