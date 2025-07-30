"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const beforeGetAll = (req, res, next) => {
    req.body.initialFilter = req.params.productId
        ? { product: req.params.productId }
        : {};
    next();
};
const beforeCreate = (req, res, next) => {
    req.body = {
        user: req.body.userId || req.user._id,
        product: req.body.productId || req.params.productId,
        rating: req.body.rating,
        comment: req.body.comment,
    };
    next();
};
const beforeUpdate = (req, res, next) => {
    req.body = {
        rating: req.body.rating,
        comment: req.body.comment,
    };
    next();
};
const beforeDelete = (req, res, next) => {
    req.body.productId = req.params.productId;
    next();
};
const reviewMiddleware = {
    beforeGetAll,
    beforeCreate,
    beforeUpdate,
    beforeDelete,
};
exports.default = reviewMiddleware;
