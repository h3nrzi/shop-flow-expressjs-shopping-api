import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError {
	statusCode = 401;

	constructor() {
		super("دسترسی غیرمجاز");

		// Only because we are extending a built in class
		Object.setPrototypeOf(this, NotAuthorizedError.prototype);
	}

	serializeErrors() {
		return [
			{
				message: "دسترسی غیرمجاز",
			},
		];
	}
}
