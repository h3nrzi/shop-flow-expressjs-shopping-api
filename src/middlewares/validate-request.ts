import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";

export const validateRequest: RequestHandler = (req, res, next) => {
	// check for validation errors
	const errors = validationResult(req);

	// if there are errors, throw a request validation error
	if (!errors.isEmpty()) {
		throw new RequestValidationError(errors.array());
	}

	next();
};
