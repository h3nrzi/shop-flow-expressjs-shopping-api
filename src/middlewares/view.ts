import { RequestHandler } from "express";
import verifyToken from "../utils/verifyToken";
import { userRepository } from "../core";

// Only for rendered pages
const isLoggedIn: RequestHandler = async (req, res, next) => {
	// get token from headers or cookies
	const { authorization } = req.headers;
	let token: string | undefined = undefined;
	if (authorization && authorization.startsWith("Bearer"))
		token = authorization.split(" ")[1];
	else if (req.cookies.jwt) token = req.cookies.jwt;

	if (token) {
		try {
			// Verify token
			const decoded = (await verifyToken(token)) as {
				id: string;
				iat: number;
				exp: number;
			};

			// Check if user still exists
			const currentUser = await userRepository.findById(decoded.id);
			if (!currentUser) {
				return res.redirect("/admin/login");
			}

			// Check if user changed password after the token was issued
			if (currentUser.changePasswordAfter(decoded.iat)) {
				return res.redirect("/admin/login");
			}

			// Check if user is admin
			if (currentUser.role !== "admin") {
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
