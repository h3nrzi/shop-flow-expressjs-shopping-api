import { ErrorRequestHandler } from "express";
import { CustomError } from "../errors/custom-error";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	// if the error is a CastError, send a 400 error and log the error
	// CastError is a Mongoose error that occurs when a value is not of the correct type
	// in this case, we are sending a 400 error and logging the error
	if (err.name === "CastError") {
		return res.status(400).send({
			status: "error",
			errors: [
				{
					field: err.path,
					message: "شناسه کاربر معتبر نیست",
				},
			],
		});
	}

	// if the error is a duplicate key error, send a 400 error and log the error
	// duplicate key error is a Mongoose error that occurs when a value is not unique
	// in this case, we are sending a 400 error and logging the error
	if (err.code === 11000 && err.keyPattern?.email) {
		return res.status(400).send({
			status: "error",
			errors: [
				{
					field: err.path,
					message: "این ایمیل قبلا استفاده شده است",
				},
			],
		});
	}

	// if the error is an instance of CustomError,
	// then send the error with the status code and the serialized errors
	if (err instanceof CustomError) {
		return res.status(err.statusCode).send({
			status: "error",
			errors: err.serializeErrors(),
		});
	}

	// if the error is not an instance of CustomError,
	// send a 500 error and log the error
	console.error(err);
	return res.status(500).send({
		status: "error",
		errors: [
			{
				field: null,
				message: "یک چیزی خیلی اشتباه پیش رفت",
			},
		],
	});
};
