export class ILoginDto {
  email: string;
  password: string;
}

export class ILoginResponse {
  message: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  userRoles: string[];
}

export class IRefreshResponseDto {
  accessToken: string;
}
