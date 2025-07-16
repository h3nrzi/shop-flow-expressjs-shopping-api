import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError {
	statusCode = 401;

	constructor(message?: string) {
		super(message || "دسترسی غیرمجاز");

		// Only because we are extending a built in class
		Object.setPrototypeOf(this, NotAuthorizedError.prototype);
	}

	serializeErrors() {
		return [
			{
				message: this.message,
			},
		];
	}
}
