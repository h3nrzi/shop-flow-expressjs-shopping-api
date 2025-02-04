import { RequestHandler } from "express";
import AppError from "../utils/appError";

const notFound: RequestHandler = (req, res, next) => {
	const msg = `Can't find ${req.originalUrl} on this server`;
	const error = new AppError(msg, 404);
	next(error);
};

const errorMiddleware = { notFound };
export default errorMiddleware;
