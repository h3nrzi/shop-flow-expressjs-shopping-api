export abstract class CustomError extends Error {
	constructor(message: string) {
		super(message);

		// Only because we are extending a built-in class
		Object.setPrototypeOf(this, CustomError.prototype);
	}

	abstract statusCode: number;
	abstract serializeErrors: () => {
		field: string | null;
		message: string;
	}[];
}
