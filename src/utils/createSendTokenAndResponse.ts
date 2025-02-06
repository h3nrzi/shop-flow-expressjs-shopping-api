import { Response } from "express";
import { IUser } from "../types";
import _ from "lodash";
import ms from "ms";

const createSendTokenAndResponse = (user: IUser, statusCode: number, res: Response) => {
	const token = user.signToken();

	res.cookie("jwt", token, {
		expires: new Date(Date.now() + ms(process.env.JWT_COOKIE_EXPIRES_IN!)),
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "none",
	});

	return res
		.status(statusCode)
		.header("x-auth-token", token)
		.json({
			status: "success",
			data: { user: _.pick(user, ["id", "name", "email", "role"]) },
		});
};

export default createSendTokenAndResponse;
