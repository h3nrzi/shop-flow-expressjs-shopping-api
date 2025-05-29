import { RequestHandler } from "express";

const beforeGetAll: RequestHandler = (req, res, next) => {
	req.body.initialFilter = req.params.productId
		? { product: req.params.productId }
		: {};
	next();
};

const beforeCreate: RequestHandler = (req, res, next) => {
	req.body = {
		user: req.body.userId || req.user._id,
		product: req.body.productId || req.params.productId,
		rating: req.body.rating,
		comment: req.body.comment,
	};
	next();
};

const beforeUpdate: RequestHandler = (req, res, next) => {
	req.body = {
		rating: req.body.rating,
		comment: req.body.comment,
	};
	next();
};

const reviewMiddleware = { beforeGetAll, beforeCreate, beforeUpdate };
export default reviewMiddleware;
