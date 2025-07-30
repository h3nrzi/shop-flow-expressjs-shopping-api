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
const products_helper_1 = require("@/__tests__/helpers/products.helper");
const core_1 = require("@/core");
describe("GET /api/products", () => {
    describe("200", () => {
        it("if request is without query", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, products_helper_1.getAllProductsRequest)({});
            expect(res.status).toBe(200);
        }));
        it("if request is with query", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, products_helper_1.getAllProductsRequest)({
                discount: 10,
                countInStock: 10,
            });
            expect(res.status).toBe(200);
        }));
        it("if pagination works", () => __awaiter(void 0, void 0, void 0, function* () {
            for (let i = 0; i < 10; i++) {
                yield core_1.productRepository.createOne({
                    name: `Product ${i}`,
                    price: i * 1000,
                    countInStock: 10,
                    discount: 10,
                    isAvailable: true,
                    brand: `Brand ${i}`,
                    category: `Category ${i}`,
                    rating: i,
                    numReviews: i,
                    description: `Description ${i}`,
                    image: `Image ${i}`,
                });
            }
            const res = yield (0, products_helper_1.getAllProductsRequest)({
                page: 2,
                limit: 5,
            });
            expect(res.status).toBe(200);
            expect(res.body.pagination.page).toBe(2);
            expect(res.body.pagination.limit).toBe(5);
        }));
        it("if filter by brand", () => __awaiter(void 0, void 0, void 0, function* () {
            yield core_1.productRepository.createOne({
                name: "Samsung Phone",
                price: 50000,
                countInStock: 10,
                discount: 0,
                isAvailable: true,
                brand: "Samsung",
                category: "Electronics",
                rating: 4.5,
                numReviews: 10,
                description: "Samsung smartphone",
                image: "samsung.jpg",
            });
            const res = yield (0, products_helper_1.getAllProductsRequest)({
                brand: "Samsung",
            });
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
        }));
        it("if filter by category", () => __awaiter(void 0, void 0, void 0, function* () {
            yield core_1.productRepository.createOne({
                name: "Gaming Laptop",
                price: 100000,
                countInStock: 5,
                discount: 15,
                isAvailable: true,
                brand: "ASUS",
                category: "Computers",
                rating: 4.8,
                numReviews: 25,
                description: "High-performance gaming laptop",
                image: "laptop.jpg",
            });
            const res = yield (0, products_helper_1.getAllProductsRequest)({
                category: "Computers",
            });
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
        }));
        it("if filter by availability", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, products_helper_1.getAllProductsRequest)({
                isAvailable: true,
            });
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
        }));
        it("if search query works", () => __awaiter(void 0, void 0, void 0, function* () {
            yield core_1.productRepository.createOne({
                name: "iPhone 14 Pro",
                price: 120000,
                countInStock: 8,
                discount: 5,
                isAvailable: true,
                brand: "Apple",
                category: "Smartphones",
                rating: 4.9,
                numReviews: 50,
                description: "Latest iPhone with advanced camera",
                image: "iphone.jpg",
            });
            const res = yield (0, products_helper_1.getAllProductsRequest)({
                search: "iPhone",
            });
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
        }));
        it("if multiple filters works", () => __awaiter(void 0, void 0, void 0, function* () {
            for (let i = 0; i < 20; i++) {
                yield core_1.productRepository.createOne({
                    name: `Product ${i}`,
                    price: i * 1000,
                    countInStock: 10,
                    discount: 10,
                    isAvailable: true,
                    brand: `Brand ${i % 10}`,
                    category: `Category ${i % 10}`,
                    rating: i,
                    numReviews: i,
                    description: `Description ${i}`,
                    image: `Image ${i}`,
                });
            }
            const res = yield (0, products_helper_1.getAllProductsRequest)({
                brand: "Brand 0",
                category: "Category 0",
                isAvailable: true,
                page: 1,
                limit: 10,
            });
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
        }));
        it("if sorting works", () => __awaiter(void 0, void 0, void 0, function* () {
            const resAsc = yield (0, products_helper_1.getAllProductsRequest)({
                sort: "asc",
            });
            expect(resAsc.status).toBe(200);
            const resDesc = yield (0, products_helper_1.getAllProductsRequest)({
                sort: "desc",
            });
            expect(resDesc.status).toBe(200);
        }));
        it("if empty results works", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, products_helper_1.getAllProductsRequest)({
                brand: "NonExistentBrand",
            });
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
        }));
        it("if return proper data structure", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, products_helper_1.getAllProductsRequest)({});
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("data");
            expect(res.body).toHaveProperty("pagination");
            if (res.body.pagination) {
                expect(res.body.pagination).toHaveProperty("page");
                expect(res.body.pagination).toHaveProperty("limit");
                expect(res.body.pagination).toHaveProperty("total");
            }
        }));
    });
});
