"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validProduct = exports.getProductRequest = exports.getAllProductsRequest = void 0;
const app_1 = __importDefault(require("@/app"));
const supertest_1 = __importDefault(require("supertest"));
const getAllProductsRequest = (query) => {
    const queryString = query
        ? Object.entries(query)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
        : "";
    return (0, supertest_1.default)(app_1.default).get(`/api/products?${queryString}`);
};
exports.getAllProductsRequest = getAllProductsRequest;
const getProductRequest = (id) => {
    return (0, supertest_1.default)(app_1.default).get(`/api/products/${id}`);
};
exports.getProductRequest = getProductRequest;
exports.validProduct = {
    name: "Test Product",
    description: "A test product",
    image: "test.jpg",
    brand: "TestBrand",
    category: "TestCategory",
    countInStock: 10,
    isAvailable: true,
    rating: 5,
    numReviews: 10,
    discount: 10,
    price: 1000,
};
