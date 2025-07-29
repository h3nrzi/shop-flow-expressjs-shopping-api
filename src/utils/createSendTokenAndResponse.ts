import { Response } from "express";
import { IUserDoc } from "../core/users/user.interface";
import _ from "lodash";
import ms from "ms";

const createSendTokenAndResponse = (
	user: IUserDoc,
	statusCode: number,
	res: Response,
) => {
	const accessToken = user.signToken();
	const refreshToken = user.signRefreshToken();

	// Set access token cookie
	res.cookie("jwt", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: ms(process.env.JWT_COOKIE_EXPIRES_IN!),
	});

	// Set refresh token cookie
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: ms(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN!),
	});

	// Store refresh token in database
	user.refreshToken = refreshToken;
	user.refreshTokenExpires = new Date(Date.now() + ms(process.env.JWT_REFRESH_EXPIRES_IN!));
	user.save({ validateBeforeSave: false });

	return res
		.status(statusCode)
		.header("x-auth-token", accessToken)
		.json({
			status: "success",
			data: {
				user: _.pick(user, [
					"id",
					"name",
					"email",
					"role",
					"photo",
				]),
			},
		});
};

export default createSendTokenAndResponse;
