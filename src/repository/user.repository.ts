import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma/prisma.service';
import { RegisterRequest } from 'src/dto/authentication.request';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(registerDto: RegisterRequest) {
    await this.prismaService.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        password: registerDto.password,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findUserByUsername(username: string) {
    return await this.prismaService.user.findUnique({
      where: { username },
    });
  }
}
