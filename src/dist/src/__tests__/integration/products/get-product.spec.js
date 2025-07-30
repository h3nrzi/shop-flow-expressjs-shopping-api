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
const products_helper_1 = require("@/__tests__/helpers/products.helper");
const core_1 = require("@/core");
const mongoose_1 = __importDefault(require("mongoose"));
describe("GET /api/products/:id", () => {
    describe("400", () => {
        it("if id is not a valid object id", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, products_helper_1.getProductRequest)("invalid-id");
            expect(res.status).toBe(400);
        }));
    });
    describe("404", () => {
        it("if product not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, products_helper_1.getProductRequest)(invalidId);
            expect(res.status).toBe(404);
        }));
    });
    describe("200", () => {
        it("if find the product", () => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield core_1.productRepository.createOne({
                name: "Test Product",
                description: "Test Description",
                price: 100000,
                image: "https://via.placeholder.com/150",
                category: "Test Category",
                brand: "Test Brand",
                countInStock: 10,
                isAvailable: true,
                rating: 5,
                numReviews: 10,
                discount: 10,
            });
            const res = yield (0, products_helper_1.getProductRequest)(product.id);
            expect(res.status).toBe(200);
            expect(res.body.data.product.id).toBe(product.id);
        }));
    });
});
