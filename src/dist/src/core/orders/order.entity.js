"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const orderItemSchema = new mongoose_1.default.Schema({
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    qty: { type: Number, required: true },
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
const shippingAddressSchema = new mongoose_1.default.Schema({
    province: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});
const orderSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0.0 },
    taxPrice: { type: Number, default: 0.0 },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
});
const Order = mongoose_1.default.model("Order", orderSchema);
exports.Order = Order;
