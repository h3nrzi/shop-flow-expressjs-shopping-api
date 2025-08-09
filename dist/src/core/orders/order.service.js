"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const bad_request_error_1 = require("../../errors/bad-request-error");
const forbidden_error_1 = require("../../errors/forbidden-error");
const not_found_error_1 = require("../../errors/not-found-error");
class OrderService {
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }
    getAllOrders(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, skip, total, orders } = yield this.orderRepository.findAll(query, {}, "user orderItems.product");
            if (query.page && skip >= total) {
                throw new not_found_error_1.NotFoundError("این صفحه وجود ندارد");
            }
            return { pagination, orders };
        });
    }
    getCurrentUserOrders(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, skip, total, orders } = yield this.orderRepository.findAll(query, {
                user: userId,
            }, "user orderItems.product");
            if (query.page && skip >= total) {
                throw new not_found_error_1.NotFoundError("این صفحه وجود ندارد");
            }
            return { pagination, orders };
        });
    }
    getOrderById(orderId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.findById(orderId, "user orderItems.product");
            if (!order) {
                throw new not_found_error_1.NotFoundError("هیچ سفارشی با این شناسه یافت نشد");
            }
            if (order.user.toString() !== userId && role === "user") {
                throw new forbidden_error_1.ForbiddenError("شما اجازه دسترسی و ویرایش یا حذف این سفارش را ندارید");
            }
            return order;
        });
    }
    getAllTopsOrders(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.orderRepository.findAllTops(10);
        });
    }
    createOrder(createOrderDto, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!createOrderDto.orderItems ||
                !Array.isArray(createOrderDto.orderItems) ||
                createOrderDto.orderItems.length === 0) {
                throw new bad_request_error_1.BadRequestError("شناسه محصول معتبر نیست");
            }
            for (const item of createOrderDto.orderItems) {
                if (!item.productId) {
                    throw new bad_request_error_1.BadRequestError("شناسه محصول معتبر نیست");
                }
                if (!item.qty || item.qty <= 0) {
                    throw new bad_request_error_1.BadRequestError("تعداد محصولات الزامی است");
                }
                const product = yield this.productRepository.getOne(item.productId);
                if (!product) {
                    throw new not_found_error_1.NotFoundError("محصولی با این شناسه یافت نشد");
                }
            }
            return this.orderRepository.create(createOrderDto, userId);
        });
    }
    updateOrder(orderId, updateOrderDto, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getOrderById(orderId, userId, role);
            return this.orderRepository.updateById(orderId, updateOrderDto);
        });
    }
    updateOrderToPaid(orderId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.getOrderById(orderId, userId, role);
            order.isPaid = true;
            order.paidAt = new Date();
            for (const item of order.orderItems) {
                const productId = item.product.toString();
                const product = yield this.productRepository.getOne(productId);
                if (!product) {
                    throw new not_found_error_1.NotFoundError("محصولی با این شناسه یافت نشد");
                }
                if (product.countInStock <= 0 || product.countInStock < item.qty) {
                    throw new bad_request_error_1.BadRequestError("موجودی محصول کافی نیست");
                }
                product.countInStock -= item.qty;
                yield product.save();
            }
            return order.save();
        });
    }
    updateOrderToDeliver(orderId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.getOrderById(orderId, userId, role);
            order.isDelivered = true;
            order.deliveredAt = new Date(Date.now());
            const updatedOrder = yield order.save();
            return updatedOrder;
        });
    }
    deleteOrder(orderId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getOrderById(orderId, userId, role);
            return this.orderRepository.deleteById(orderId);
        });
    }
}
exports.OrderService = OrderService;
