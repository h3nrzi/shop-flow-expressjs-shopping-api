import { RequestHandler } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import verifyToken from "../utils/verifyToken";
import { userRepository } from "../core";

const protect: RequestHandler = async (req, res, next) => {
	// get token from headers or cookies
	const { authorization } = req.headers;
	let token: string | undefined = undefined;
	if (authorization && authorization.startsWith("Bearer"))
		token = authorization.split(" ")[1];
	else if (req.cookies.jwt) token = req.cookies.jwt;

	// if no token, throw an error
	if (!token) {
		throw new NotAuthorizedError(
			"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
		);
	}

	// check if token is valid, if not throw an NotAuthorizedError
	const decoded = (await verifyToken(token)) as {
		id: string;
		iat: number;
		exp: number;
	};

	// find user by id, if user not found, throw an NotAuthorizedError
	const user = await userRepository.findById(decoded.id);
	if (!user) {
		const msg = "کاربر متعلق به این توکن دیگر وجود ندارد!";
		throw new NotAuthorizedError(msg);
	}

	if (!user.active) {
		const msg = "کاربری که به این ایمیل مرتبط است غیرفعال شده!";
		throw new NotAuthorizedError(msg);
	}

	if (user.changePasswordAfter(decoded.iat)) {
		const msg =
			"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید.";
		throw new NotAuthorizedError(msg);
	}

	req.user = user;
	return next();
};

const restrictTo = (...roles: string[]): RequestHandler => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new NotAuthorizedError("شما اجازه انجام این عمل را ندارید!");
		}
		return next();
	};
};

const authMiddleware = { protect, restrictTo };
export default authMiddleware;
