import * as jose from "jose";

export const validateJwt = async (token: string) => {
	const secretKey = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
	const decoded = await jose.jwtVerify(token, secretKey);
	return decoded.payload;
};
