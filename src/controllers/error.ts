import { ErrorRequestHandler, Response } from "express";
import { CastError } from "mongoose";
import AppError from "../utils/appError";
import { OperationalError } from "../types";
import { MulterError } from "multer";

const sendErrorDev = (err: OperationalError | any, res: Response) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err: OperationalError | any, res: Response) => {
	// Trusted Errors
	if (err.isOperational) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	}

	// Unknown Errors
	console.error("🔹Unknown Error: ", err);
	return res.status(500).json({
		status: "error",
		message: "یک چیزی خیلی اشتباه پیش رفت",
	});
};

////////////////////////////////

const handleCastError = (err: CastError) => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

const handleDuplicateFields = (err: any) => {
	const msg = `این ایمیل ${err.keyValue.email}  قبلا ثبت شده است! لطفا از آدرس ایمیل دیگری استفاده کنید.`;
	return new AppError(msg, 400);
};

const handleValidationError = (err: any) => {
	const messages: string[] = Object.values(err.errors).map(
		(error: any) => error.message,
	);
	const message = `${messages.join(" - ")}`;
	return new AppError(message, 400);
};

const handleJWTTokenError = () => {
	const message = "توکن نامعتبر است! لطفا دوباره وارد شوید!";
	return new AppError(message, 401);
};

const handleJWTExpiredError = () => {
	const message = "توکن شما منقضی شده است! لطفا دوباره وارد شوید!";
	return new AppError(message, 401);
};

function handleMulterError(err: MulterError) {
	if (err.code === "LIMIT_UNEXPECTED_FILE") {
		const message = "لطفا عکس را با فیلد image ارسال کنید";
		return new AppError(message, 400);
	}

	return;
}

////////////////////////////////

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (err.name === "CastError") err = handleCastError(err);
	if (err.code === 11000) err = handleDuplicateFields(err);
	if (err.name === "ValidationError") err = handleValidationError(err);
	if (err.name === "JsonWebTokenError") err = handleJWTTokenError();
	if (err.name === "TokenExpiredError") err = handleJWTExpiredError();
	if (err.name === "MulterError") err = handleMulterError(err);

	if (process.env.NODE_ENV === "development") return sendErrorDev(err, res);
	else return sendErrorProd(err, res);
};

const errorController = { globalErrorHandler };
export default errorController;
