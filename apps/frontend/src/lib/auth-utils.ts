// utils/auth-client.ts
import type { IRefreshResponseDto } from "@/types/auth.types";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "./axios";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./constants/auth.constants";

export const refreshToken = async () => {
	const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
	if (!refreshToken) return null;

	try {
		const { accessToken } = await axiosInstance.post<
			{ refreshToken: string },
			{ accessToken: string }
		>("/auth/refresh-token", { refreshToken });

		localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
		return accessToken;
	} catch (error) {
		console.error("Failed to refresh token", error);
		return null;
	}
};

export const logout = () => {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
	window.location.href = "/";
};

export const getAccessToken = async () => {
	const token = localStorage.getItem(ACCESS_TOKEN_KEY);
	if (!token) return null;

	try {
		const decoded = jwtDecode(token);
		if (decoded.exp && decoded.exp * 1000 > Date.now()) {
			return token;
		} else {
			return await refreshToken();
		}
	} catch (e) {
		console.log("Invalid token:", e);
		return await refreshToken();
	}
};

export const getSession = async () => {
	const token = await getAccessToken();
	if (!token) return null;

	try {
		return jwtDecode(token);
	} catch {
		return null;
	}
};

export const getNewAccessToken = async () => {
	try {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
		if (!refreshToken) return null;

		const { accessToken } = await axiosInstance.post<
			{ refreshToken: string },
			IRefreshResponseDto
		>("/auth/refresh-token", { refreshToken });

		localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

		const session = jwtDecode(accessToken);
		if (session) {
			// router.push("/dashboard");
		}
	} catch (error) {
		console.error("getNewAccessToken error:", error);
		return null;
	}
};
