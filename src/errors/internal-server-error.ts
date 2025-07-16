import { CustomError } from "./custom-error";

export class InternalServerError extends CustomError {
	statusCode = 500;

	constructor(message: string) {
		super(message);

		// Only because we are extending a built-in class
		Object.setPrototypeOf(this, InternalServerError.prototype);
	}

	serializeErrors = () => {
		return [
			{
				field: null,
				message: this.message,
			},
		];
	};
}
