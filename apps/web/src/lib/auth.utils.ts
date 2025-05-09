"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AxiosRequest } from "./axios";
import { validateJwt } from "./jwt-util";

export const refreshToken = async () => {
	const refreshToken = (await cookies()).get("refreshToken")?.value;
	if (!refreshToken) {
		return null;
	}
	await validateJwt(refreshToken);
	const { accessToken } = await AxiosRequest.post<
		{ refreshToken: string },
		{ accessToken: string }
	>("/auth/refresh-token", { refreshToken });
	(await cookies()).set("accessToken", accessToken, { httpOnly: true });
	return accessToken;
};

export const logout = async () => {
	// todo: Clear Refresh Token from db

	(await cookies()).delete("accessToken");
	(await cookies()).delete("refreshToken");

	redirect("/");
};

export const getSession = async () => {
	const token = await getAccessToken();
	if (!token) {
		return null;
	}
	const data = await validateJwt(token);
	return data;
};

export const getAccessToken = async () => {
	const token = (await cookies()).get("accessToken")?.value;
	if (!token) {
		return null;
	}
	try {
		const decodedToken = await validateJwt(token);
		if (decodedToken && decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
			return token;
		} else {
			return refreshToken();
		}
	} catch (e) {
		console.log("error", e);
	}
};
