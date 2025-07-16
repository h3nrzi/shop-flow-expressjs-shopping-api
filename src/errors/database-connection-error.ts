import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
	statusCode = 500;
	reason = "Error connecting to db!";

	constructor() {
		super("Error connecting to db!");

		// Only because we are extending a built-in class
		Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
	}

	serializeErrors(): { message: string }[] {
		return [
			{
				message: this.reason,
			},
		];
	}
}
