"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getMyOrders = (req, res, next) => {
    req.body.initialFilter = { user: req.user._id };
    next();
};
const beforeCreate = (req, res, next) => {
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
const beforeUpdate = (req, res, next) => {
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
const orderMiddleware = {
    beforeCreate,
    beforeUpdate,
    getMyOrders,
};
exports.default = orderMiddleware;
