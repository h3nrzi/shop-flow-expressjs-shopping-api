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
describe("POST /api/orders", () => {
    let product;
    let cookie;
    let user;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        product = yield (0, orders_helper_1.createTestProduct)();
        const testUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("orderuser");
        cookie = testUser.cookie;
        user = testUser.user;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = (0, orders_helper_1.getValidOrderData)(product._id.toString());
            const res = yield (0, orders_helper_1.createOrderRequest)(orderData);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = (0, orders_helper_1.getValidOrderData)(product._id.toString());
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, orders_helper_1.createOrderRequest)(orderData, invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        const invalidDataCases = (0, orders_helper_1.getInvalidOrderData)();
        invalidDataCases.forEach(({ testCase, data, expectedError }) => {
            it(testCase, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, orders_helper_1.createOrderRequest)(data, cookie);
                expect(res.status).toBe(400);
                expect(res.body.errors[0].message).toBe(expectedError);
            }));
        });
    });
    describe("should return 404, if", () => {
        it("product does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentProductId = (0, orders_helper_1.getInvalidObjectId)();
            const orderData = (0, orders_helper_1.getValidOrderData)(nonExistentProductId);
            const res = yield (0, orders_helper_1.createOrderRequest)(orderData, cookie);
            expect(res.status).toBe(404);
        }));
    });
    describe("should return 201, if", () => {
        it("order is created successfully with valid data", () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = (0, orders_helper_1.getValidOrderData)(product._id.toString(), 3);
            const res = yield (0, orders_helper_1.createOrderRequest)(orderData, cookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
            expect(res.body.data.order).toBeDefined();
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order, orderData);
        }));
        it("order is created with multiple products", () => __awaiter(void 0, void 0, void 0, function* () {
            const product2 = yield (0, orders_helper_1.createTestProduct)();
            const orderData = {
                orderItems: [
                    {
                        productId: product._id.toString(),
                        qty: 2,
                    },
                    {
                        productId: product2._id.toString(),
                        qty: 1,
                    },
                ],
                shippingAddress: {
                    province: "Tehran",
                    city: "Tehran",
                    street: "Valiasr Street, No. 123",
                },
                paymentMethod: "Credit Card",
                itemsPrice: 30000,
                shippingPrice: 5000,
                taxPrice: 3000,
                totalPrice: 38000,
            };
            const res = yield (0, orders_helper_1.createOrderRequest)(orderData, cookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
            expect(res.body.data.order).toBeDefined();
            expect(res.body.data.order.orderItems).toHaveLength(2);
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order, orderData);
        }));
        it("order has correct default status values", () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = (0, orders_helper_1.getValidOrderData)(product._id.toString());
            const res = yield (0, orders_helper_1.createOrderRequest)(orderData, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.order.isPaid).toBe(false);
            expect(res.body.data.order.isDelivered).toBe(false);
            expect(res.body.data.order.paidAt).toBeUndefined();
            expect(res.body.data.order.deliveredAt).toBeUndefined();
        }));
        it("order is associated with the correct user", () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = (0, orders_helper_1.getValidOrderData)(product._id.toString());
            const res = yield (0, orders_helper_1.createOrderRequest)(orderData, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.order.user).toBe(user._id.toString());
        }));
    });
});
