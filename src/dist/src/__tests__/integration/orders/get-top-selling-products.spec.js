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
const auth_helper_1 = require("@/__tests__/helpers/auth.helper");
const orders_helper_1 = require("@/__tests__/helpers/orders.helper");
describe("GET /api/orders/top-selling-products", () => {
    let cookie;
    let user;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("orderuser");
        cookie = testUser.cookie;
        user = testUser.user;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getTopSellingProductsRequest)();
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, orders_helper_1.getTopSellingProductsRequest)(invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 200, if", () => {
        it("no orders exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getTopSellingProductsRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.result).toBe(0);
            expect(res.body.data.orders).toEqual([]);
        }));
        it("orders exist and returns top selling products", () => __awaiter(void 0, void 0, void 0, function* () {
            const product1 = yield (0, orders_helper_1.createTestProduct)();
            const product2 = yield (0, orders_helper_1.createTestProduct)();
            const product3 = yield (0, orders_helper_1.createTestProduct)();
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product1._id.toString(), {
                orderItems: [
                    { productId: product1._id.toString(), qty: 5 },
                ],
            });
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product2._id.toString(), {
                orderItems: [
                    { productId: product2._id.toString(), qty: 3 },
                ],
            });
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product3._id.toString(), {
                orderItems: [
                    { productId: product3._id.toString(), qty: 8 },
                ],
            });
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product1._id.toString(), {
                orderItems: [
                    { productId: product1._id.toString(), qty: 2 },
                ],
            });
            const res = yield (0, orders_helper_1.getTopSellingProductsRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.result).toBeGreaterThan(0);
            expect(res.body.data.orders).toBeDefined();
            expect(Array.isArray(res.body.data.orders)).toBe(true);
        }));
        it("returns products sorted by total quantity sold (descending)", () => __awaiter(void 0, void 0, void 0, function* () {
            const product1 = yield (0, orders_helper_1.createTestProduct)();
            const product2 = yield (0, orders_helper_1.createTestProduct)();
            const product3 = yield (0, orders_helper_1.createTestProduct)();
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product1._id.toString(), {
                orderItems: [
                    { productId: product1._id.toString(), qty: 5 },
                ],
            });
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product1._id.toString(), {
                orderItems: [
                    { productId: product1._id.toString(), qty: 2 },
                ],
            });
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product2._id.toString(), {
                orderItems: [
                    { productId: product2._id.toString(), qty: 3 },
                ],
            });
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product3._id.toString(), {
                orderItems: [
                    { productId: product3._id.toString(), qty: 10 },
                ],
            });
            const res = yield (0, orders_helper_1.getTopSellingProductsRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(3);
            const orders = res.body.data.orders;
            expect(orders[0].totalSold).toBe(10);
            expect(orders[1].totalSold).toBe(7);
            expect(orders[2].totalSold).toBe(3);
        }));
        it("includes product information in the response", () => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield (0, orders_helper_1.createTestProduct)();
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product._id.toString(), {
                orderItems: [
                    { productId: product._id.toString(), qty: 2 },
                ],
            });
            const res = yield (0, orders_helper_1.getTopSellingProductsRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(1);
            const topProduct = res.body.data.orders[0];
            expect(topProduct.totalSold).toBe(2);
            expect(topProduct.product).toBeDefined();
            expect(Array.isArray(topProduct.product)).toBe(true);
            if (topProduct.product.length > 0) {
                const productInfo = topProduct.product[0];
                expect(productInfo).toHaveProperty("name");
                expect(productInfo).toHaveProperty("price");
            }
        }));
        it("limits results to top 10 products", () => __awaiter(void 0, void 0, void 0, function* () {
            const products = [];
            for (let i = 0; i < 15; i++) {
                const product = yield (0, orders_helper_1.createTestProduct)();
                products.push(product);
                yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product._id.toString(), {
                    orderItems: [
                        { productId: product._id.toString(), qty: i + 1 },
                    ],
                });
            }
            const res = yield (0, orders_helper_1.getTopSellingProductsRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders.length).toBeLessThanOrEqual(10);
        }));
        it("handles orders with multiple items correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const product1 = yield (0, orders_helper_1.createTestProduct)();
            const product2 = yield (0, orders_helper_1.createTestProduct)();
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product1._id.toString(), {
                orderItems: [
                    { productId: product1._id.toString(), qty: 3 },
                    { productId: product2._id.toString(), qty: 2 },
                ],
            });
            yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product1._id.toString(), {
                orderItems: [
                    { productId: product1._id.toString(), qty: 1 },
                ],
            });
            const res = yield (0, orders_helper_1.getTopSellingProductsRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(2);
            const product1Result = res.body.data.orders.find((item) => item.product[0] &&
                item.product[0]._id.toString() ===
                    product1._id.toString());
            const product2Result = res.body.data.orders.find((item) => item.product[0] &&
                item.product[0]._id.toString() ===
                    product2._id.toString());
            expect(product1Result.totalSold).toBe(4);
            expect(product2Result.totalSold).toBe(2);
        }));
    });
});
