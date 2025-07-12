import AppError from "../utils/appError";
import verifyToken from "../utils/verifyToken";
import User from "../_refactor/users/entities/user.entity";
import { RequestHandler } from "express";

const protect: RequestHandler = async (req, res, next) => {
	const { authorization } = req.headers;
	let token: string | undefined = undefined;

	if (authorization && authorization.startsWith("Bearer"))
		token = authorization.split(" ")[1];
	else if (req.cookies.jwt) token = req.cookies.jwt;

	if (!token) {
		const msg = "شما وارد نشده اید! لطفا برای دسترسی وارد شوید";
		return next(new AppError(msg, 401));
	}

	const decoded = (await verifyToken(token)) as {
		id: string;
		iat: number;
		exp: number;
	};

	const user = await User.findOne({ _id: decoded.id }).select("+active");

	if (!user) {
		const msg = "کاربر متعلق به این توکن دیگر وجود ندارد!";
		return next(new AppError(msg, 401));
	}

	if (!user.active) {
		const msg = "کاربری که به این ایمیل مرتبط است غیرفعال شده!";
		return next(new AppError(msg, 404));
	}

	if (user.changePasswordAfter(decoded.iat)) {
		const msg =
			"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید.";
		return next(new AppError(msg, 401));
	}

	req.user = user;
	return next();
};

const restrictTo = (...roles: string[]): RequestHandler => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new AppError("شما اجازه انجام این عمل را ندارید!", 403));
		}
		return next();
	};
};

const authMiddleware = { protect, restrictTo };
export default authMiddleware;
