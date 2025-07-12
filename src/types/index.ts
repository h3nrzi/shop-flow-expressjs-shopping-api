export interface Populate {
	path: string;
	select?: string;
}

export interface OperationalError extends Error {
	statusCode: number;
	status: string;
	isOperational?: boolean;
}
