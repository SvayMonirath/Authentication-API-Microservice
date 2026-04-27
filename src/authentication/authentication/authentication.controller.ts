import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginRequest, RegisterRequest } from 'src/dto/authentication.request';
import {
  LoginResponse,
  RegisterResponse,
} from 'src/dto/authentication.response';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

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
  async login(@Body() loginDto: LoginRequest): Promise<LoginResponse> {
    const access_token = await this.authenticationService.login(loginDto);

    return {
      status: 'success',
      message: 'User logged in successfully',
      data: { access_token },
    };
  }

  @Post('logout')
  logout() {
    return {
      status: 'success',
      message: 'User logged out successfully. Discard token on client side.',
    };
  }
}
