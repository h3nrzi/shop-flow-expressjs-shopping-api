import crypto from "node:crypto";
import User from "../core/users/user.entity";
import {
	ForgotPasswordRequestHandler,
	LoginRequestHandler,
	ResetPasswordRequestHandler,
	SignupRequestHandler,
} from "../dtos";
import createSendTokenAndResponse from "../utils/createSendTokenAndResponse";
import AppError from "../utils/appError";
import sendEmail from "../utils/email";
import { RequestHandler } from "express";
import ms from "ms";

const signup: SignupRequestHandler = async (req, res, next) => {
	const { name, email, password, passwordConfirmation } = req.body;

	const user = await User.create({
		name,
		email,
		password,
		passwordConfirmation,
	});

	return createSendTokenAndResponse(user, 201, res);
};

const login: LoginRequestHandler = async (req, res, next) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email }).select("+password +active");
	if (!user) return next(new AppError("ایمیل یا رمز عبور نادرست!", 401));

	if (!user.active)
		return next(
			new AppError("کاربری که به این ایمیل مرتبط است غیرفعال شده!", 404)
		);

	const correct = await user.correctPassword(password);
	if (!correct) return next(new AppError("ایمیل یا رمز عبور نادرست!", 401));

	return createSendTokenAndResponse(user, 200, res);
};

const logout: RequestHandler = (req, res, next) => {
	res.cookie("jwt", "", {
		expires: new Date(Date.now() + ms(process.env.JWT_COOKIE_EXPIRES_IN!)),
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "none",
	});

	return res.status(204).header("x-auth-token", "").json({});
};

const forgotPassword: ForgotPasswordRequestHandler = async (req, res, next) => {
	const { email } = req.body;

	const user = await User.findOne({ email }).select("+active");
	if (!user)
		return next(new AppError("هیچ کاربری با این آدرس ایمیل وجود ندارد.", 404));
	if (!user.active)
		return next(
			new AppError("کاربری که به این ایمیل مرتبط است غیرفعال شده است.", 401)
		);

	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	let url = `http://localhost:5173/reset-password/${resetToken}`;

	if (process.env.NODE_ENV === "production") {
		url = `https://${process.env.EMAIL_CLIENT}/reset-password/${resetToken}`;
	}

	try {
		await sendEmail(email, url, "درخواست برای ریست کردن رمز عبور");

		return res.status(200).json({
			status: "success",
			message: "رمز با موفقیت به ایمیل ارسال شد!",
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(
			new AppError(
				"در ارسال ایمیل خطایی روی داد. لطفا بعدا دوباره امتحان کنید!",
				500
			)
		);
	}
};

const resetPassword: ResetPasswordRequestHandler = async (req, res, next) => {
	const { password, passwordConfirmation } = req.body;

	const { resetToken } = req.query;
	if (!resetToken)
		return next(new AppError("لطفا ریست توکن را ارائه دهید", 400));

	const passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");
	const user = await User.findOne({
		passwordResetToken,
		passwordResetExpires: { $gt: Date.now() },
	});
	if (!user)
		return next(new AppError("توکن نامعتبر است یا منقضی شده است!", 401));

	user.password = password;
	user.passwordConfirmation = passwordConfirmation;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	return createSendTokenAndResponse(user, 200, res);
};

const AuthController = { signup, login, logout, forgotPassword, resetPassword };
export default AuthController;
