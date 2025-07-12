import { RequestHandler } from "express";
import verifyToken from "../utils/verifyToken";
import User from "../_refactor/users/entities/user.entity";

// Only for rendered pages
const isLoggedIn: RequestHandler = async (req, res, next) => {
	if (req.cookies.jwt) {
		try {
			// Verify token
			const decoded = (await verifyToken(req.cookies.jwt)) as {
				id: string;
				iat: number;
				exp: number;
			};

			// Check if user still exists
			const currentUser = await User.findById(decoded.id);
			if (!currentUser) {
				return res.redirect("/admin/login");
			}

			// Check if user changed password after the token was issued
			if (currentUser.changePasswordAfter(decoded.iat)) {
				return res.redirect("/admin/login");
			}

			// THERE IS A Logged-in USER
			res.locals.user = currentUser;
			return next();
		} catch (err) {
			return res.redirect("/admin/login");
		}
	}

	return res.redirect("/admin/login");
};

const viewMiddleware = { isLoggedIn };
export default viewMiddleware;
