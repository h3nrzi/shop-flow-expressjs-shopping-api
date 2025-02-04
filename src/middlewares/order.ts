import { RequestHandler } from "express";

const getMyOrders: RequestHandler = (req, res, next) => {
	req.body.initialFilter = { user: req.user._id };
	next();
};

const beforeCreate: RequestHandler = (req, res, next) => {
	req.body = {
		user: req.user._id,
		orderItems: req.body.orderItems,
		shippingAddress: req.body.shippingAddress,
		paymentMethod: req.body.paymentMethod,
		itemsPrice: req.body.itemsPrice,
		shippingPrice: req.body.shippingPrice,
		taxPrice: req.body.taxPrice,
		totalPrice: req.body.totalPrice,
	};
	next();
};

const beforeUpdate: RequestHandler = (req, res, next) => {
	req.body = {
		orderItems: req.body.orderItems,
		shippingAddress: req.body.shippingAddress,
		paymentMethod: req.body.paymentMethod,
		itemsPrice: req.body.itemsPrice,
		shippingPrice: req.body.shippingPrice,
		taxPrice: req.body.taxPrice,
		totalPrice: req.body.totalPrice,
	};
	next();
};

const orderMiddleware = { beforeCreate, beforeUpdate, getMyOrders };
export default orderMiddleware;
