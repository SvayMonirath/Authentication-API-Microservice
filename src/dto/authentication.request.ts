import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class RegisterRequest {
  @IsString()
  username: string;
  @IsEmail()
  email: string;
  @IsString()
  @IsStrongPassword()
  password: string;
  @IsString()
  confirm_password: string;
}

export class LoginRequest {
  @IsString()
  username: string;
  @IsString()
  password: string;
}
