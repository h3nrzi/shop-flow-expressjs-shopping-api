import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
	statusCode = 400;

	constructor(public override message: string) {
		super(message);

		// Only because we are extending a built-in class
		Object.setPrototypeOf(this, BadRequestError.prototype);
	}

	serializeErrors() {
		return [
			{
				message: this.message,
			},
		];
	}
}
