export interface ILoginDto {
	email: string;
	password: string;
}

export interface ILoginResponse {
	message: string;
	userId: string;
	accessToken: string;
	refreshToken: string;
}

export interface IRefreshResponseDto {
	accessToken: string;
}
