import jwt from "jsonwebtoken";
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const verifyRefreshToken = (token: string) => {
	return new Promise(resolve => {
		jwt.verify(
			token,
			process.env.JWT_REFRESH_SECRET!,
			(err, decoded) => {
				if (err) throw new NotAuthorizedError("توکن تازه‌سازی معتبر نیست");
				resolve(decoded);
			},
		);
	});
};

export const generateRefreshToken = (userId: string): string => {
	return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
		expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
	});
};