import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
	statusCode = 500;

	constructor() {
		super("Error connecting to db!");

		// Only because we are extending a built-in class
		Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
	}

	serializeErrors = () => {
		return [
			{
				field: null,
				message: "Error connecting to db!",
			},
		];
	};
}
