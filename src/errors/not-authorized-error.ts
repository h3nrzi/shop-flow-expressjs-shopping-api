import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError {
	statusCode = 401;

	constructor(message: string) {
		super(message);

		// Only because we are extending a built in class
		Object.setPrototypeOf(this, NotAuthorizedError.prototype);
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
