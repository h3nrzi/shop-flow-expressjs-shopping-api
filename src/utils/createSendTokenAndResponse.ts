import { Response } from "express";
import { IUserDoc } from "../core/users/user.interface";
import _ from "lodash";
import ms from "ms";

const createSendTokenAndResponse = (user: IUserDoc, statusCode: number, res: Response) => {
	const token = user.signToken();

	res.cookie("jwt", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: ms(process.env.JWT_COOKIE_EXPIRES_IN!),
	});

	return res
		.status(statusCode)
		.header("x-auth-token", token)
		.json({
			status: "success",
			data: { user: _.pick(user, ["id", "name", "email", "role", "photo"]) },
		});
};

export default createSendTokenAndResponse;
