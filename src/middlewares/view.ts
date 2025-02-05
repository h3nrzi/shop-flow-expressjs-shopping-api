import { RequestHandler } from "express";
import verifyToken from "../utils/verifyToken";
import User from "../models/user";

// Only for rendered pages, no errors!
const isLoggedIn: RequestHandler = async (req, res, next) => {
	if (req.cookies.jwt) {
		try {
			// 1) verify token
			const decoded = (await verifyToken(req.cookies.jwt)) as { id: string; iat: number; exp: number };

			// 2) Check if user still exists
			const currentUser = await User.findById(decoded.id);
			if (!currentUser) return next();

			// 3) Check if user changed password after the token was issued
			if (currentUser.changePasswordAfter(decoded.iat)) return next();

			console.log(currentUser);
			// THERE IS A Logged-in USER
			res.locals.user = currentUser;
			return next();
		} catch (err) {
			return next();
		}
	}
	next();
};

const viewMiddleware = { isLoggedIn };
export default viewMiddleware;
