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
exports.OrderController = void 0;
class OrderController {
    constructor(orderService, notificationService) {
        this.orderService = orderService;
        this.notificationService = notificationService;
        this.getOrderById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderService.getOrderById(req.params.id, req.user.id, req.user.role);
            res.status(200).json({
                status: "success",
                data: { order },
            });
        });
        this.getAllTopsOrders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const orders = yield this.orderService.getAllTopsOrders(10);
            res.status(200).json({
                status: "success",
                results: orders.length,
                data: { orders },
            });
        });
        this.createOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const createOrderDto = req.body;
            const userId = req.user.id;
            const order = yield this.orderService.createOrder(createOrderDto, userId);
            this.notificationService.createNotification({
                user: userId,
                title: "سفارش جدید",
                message: "سفارش شما با موفقیت ثبت شد",
                type: "order",
                data: Object.assign({}, order),
            });
            res.status(201).json({
                status: "success",
                data: { order },
            });
        });
        this.updateOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderService.updateOrder(req.params.id, req.body, req.user.id, req.user.role);
            res.status(200).json({
                status: "success",
                data: { order },
            });
        });
        this.updateOrderToPaid = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const orderId = req.params.id;
            const userId = req.user.id;
            const order = yield this.orderService.updateOrderToPaid(orderId, userId, req.user.role);
            this.notificationService.createNotification({
                user: userId,
                title: "پرداخت سفارش",
                message: "سفارش شما با موفقیت پرداخت شد",
                type: "order",
                data: Object.assign({}, order),
            });
            res.status(200).json({
                status: "success",
                data: { order },
            });
        });
        this.updateOrderToDeliver = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const orderId = req.params.id;
            const userId = req.user.id;
            const order = yield this.orderService.updateOrderToDeliver(orderId, userId, req.user.role);
            this.notificationService.createNotification({
                user: userId,
                title: "ارسال سفارش",
                message: "سفارش شما با موفقیت ارسال شد",
                type: "order",
                data: Object.assign({}, order),
            });
            res.status(200).json({
                status: "success",
                data: { order },
            });
        });
        this.deleteOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield this.orderService.deleteOrder(req.params.id, req.user.id, req.user.role);
            res.status(204);
            res.json({
                status: "success",
            });
        });
    }
    getAllOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, orders } = yield this.orderService.getAllOrders(req.query);
            res.status(200).json({
                status: "success",
                results: orders.length,
                pagination,
                data: { orders },
            });
        });
    }
    getCurrentUserOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, orders } = yield this.orderService.getCurrentUserOrders(req.user.id, req.query);
            res.status(200).json({
                status: "success",
                results: orders.length,
                pagination,
                data: { orders },
            });
        });
    }
}
exports.OrderController = OrderController;
