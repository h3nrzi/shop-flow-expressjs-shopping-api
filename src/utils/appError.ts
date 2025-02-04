class AppError extends Error {
	public readonly statusCode: number;
	public readonly status: string;
	public readonly isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);

		this.statusCode = statusCode;
		this.status = statusCode.toString().startsWith("4") ? "fail" : "error";
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;
