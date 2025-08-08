"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const slugify_1 = __importDefault(require("slugify"));
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "نام محصول را وارد کنید"],
    },
    slug: {
        type: String,
    },
    description: {
        type: String,
        required: [true, "توضیحات محصول را وارد کنید"],
    },
    image: {
        type: String,
        required: [true, "تصویر محصول را وارد کنید"],
    },
    images: {
        type: [String],
    },
    countInStock: {
        type: Number,
        default: 1,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    brand: {
        type: String,
        required: [true, "برند محصول را وارد کنید"],
    },
    category: {
        type: String,
        required: [true, "کتگوری محصول را وارد کنید"],
    },
    rating: {
        type: Number,
        default: 4.5,
        set: (value) => value.toFixed(1),
    },
    numReviews: {
        type: Number,
        default: 1,
    },
    price: {
        type: Number,
        required: [true, "قیمت محصول را وارد کنید"],
    },
    discount: {
        type: Number,
        default: 0,
    },
}, {
    toJSON: {
        virtuals: true,
        transform(doc, ret, options) {
            doc.id = doc._id;
            delete doc._id;
            delete doc.__v;
        },
    },
    toObject: {
        virtuals: true,
    },
    timestamps: true,
});
productSchema.virtual("discountedPrice").get(function () {
    const defaultValue = 0;
    if (this.discount === defaultValue)
        return null;
    const discountMultiplier = 1 - this.discount / 100;
    return Math.round(this.price * discountMultiplier);
});
productSchema.pre("save", function (next) {
    this.slug = (0, slugify_1.default)(this.name, { lower: true });
    next();
});
const Product = (0, mongoose_1.model)("Product", productSchema);
exports.Product = Product;
