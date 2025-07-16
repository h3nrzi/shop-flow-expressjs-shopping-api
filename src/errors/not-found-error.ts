import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
	statusCode = 404;

	constructor(message: string) {
		super(message);

		// Only because we are extending a built-in class
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}

	serializeErrors() {
		return [
			{
				message: this.message,
			},
		];
	}
}
