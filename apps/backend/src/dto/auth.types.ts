import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ILoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ILoginResponse {
  message: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  name: string;
}

export class IRefreshResponseDto {
  accessToken: string;
}
