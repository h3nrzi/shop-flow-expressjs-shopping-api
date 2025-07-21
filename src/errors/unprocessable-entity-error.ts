import { CustomError } from "./custom-error";

export class UnprocessableEntityError extends CustomError {
	statusCode = 422;

	constructor(public override message: string) {
		super(message);
		Object.setPrototypeOf(
			this,
			UnprocessableEntityError.prototype
		);
	}

	serializeErrors = () => [
		{
			field: null,
			message: this.message,
		},
	];
}
