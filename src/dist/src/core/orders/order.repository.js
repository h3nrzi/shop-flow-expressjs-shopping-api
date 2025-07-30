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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const apiFeatures_1 = __importDefault(require("../../utils/apiFeatures"));
class OrderRepository {
    constructor(orderModel) {
        this.orderModel = orderModel;
    }
    findAll(query, initialFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const features = new apiFeatures_1.default(this.orderModel, query, initialFilter);
            const { pagination, skip, total } = yield features
                .filter()
                .search()
                .sort()
                .limitFields()
                .pagination();
            const orders = yield features.dbQuery;
            return { pagination, skip, total, orders };
        });
    }
    findAllTops(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.orderModel.aggregate([
                {
                    $unwind: "$orderItems",
                },
                {
                    $group: {
                        _id: "$orderItems.product",
                        totalSold: { $sum: "$orderItems.qty" },
                    },
                },
                {
                    $sort: { totalSold: -1 },
                },
                {
                    $limit: limit,
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $project: {
                        _id: 0,
                    },
                },
            ]);
        });
    }
    findById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.orderModel.findById(orderId);
        });
    }
    create(payload, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.orderItems ||
                !Array.isArray(payload.orderItems)) {
                throw new Error("orderItems is required and must be an array");
            }
            return this.orderModel.create(Object.assign(Object.assign({}, payload), { user: userId, orderItems: payload.orderItems.map(item => ({
                    product: item.productId,
                    qty: item.qty,
                })) }));
        });
    }
    updateById(orderId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.orderModel.findByIdAndUpdate(orderId, payload, {
                new: true,
            });
        });
    }
    deleteById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.orderModel.findByIdAndDelete(orderId);
        });
    }
}
exports.OrderRepository = OrderRepository;
