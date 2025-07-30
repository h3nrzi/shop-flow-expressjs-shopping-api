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
describe("PATCH /api/orders/:id (Admin Only)", () => {
    let userCookie;
    let adminCookie;
    let user;
    let order;
    let product;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("orderuser");
        userCookie = testUser.cookie;
        user = testUser.user;
        const testAdmin = yield (0, orders_helper_1.createTestUserAndGetCookie)("admin", "admin");
        adminCookie = testAdmin.cookie;
        product = yield (0, orders_helper_1.createTestProduct)();
        order = yield (0, orders_helper_1.createTestOrder)(user._id.toString(), product._id.toString());
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { paymentMethod: "PayPal" };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { paymentMethod: "PayPal" };
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("order ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { paymentMethod: "PayPal" };
            const res = yield (0, orders_helper_1.updateOrderRequest)((0, orders_helper_1.getInvalidId)(), updateData, adminCookie);
            expect(res.status).toBe(400);
        }));
        it("orderItems[0].productId is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                orderItems: [
                    {
                        productId: "invalid-id",
                        qty: 2,
                    },
                ],
            };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("فرمت شناسه محصول معتبر نیست");
        }));
        it("orderItems[0].qty is less than 1", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                orderItems: [
                    {
                        productId: product._id.toString(),
                        qty: 0,
                    },
                ],
            };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("فرمت تعداد محصولات معتبر نیست");
        }));
        it("itemsPrice is not numeric", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { itemsPrice: "not-a-number" };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("فرمت قیمت محصولات معتبر نیست");
        }));
        it("shippingPrice is not numeric", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                shippingPrice: "not-a-number",
            };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("فرمت قیمت حمل و نقل معتبر نیست");
        }));
        it("taxPrice is not numeric", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { taxPrice: "not-a-number" };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("فرمت مالیات معتبر نیست");
        }));
        it("totalPrice is not numeric", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { totalPrice: "not-a-number" };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("فرمت قیمت کل معتبر نیست");
        }));
    });
    describe("should return 403, if", () => {
        it("regular user tries to access admin endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { paymentMethod: "PayPal" };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, userCookie);
            expect(res.status).toBe(403);
        }));
    });
    describe("should return 404, if", () => {
        it("order does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentOrderId = (0, orders_helper_1.getInvalidObjectId)();
            const updateData = { paymentMethod: "PayPal" };
            const res = yield (0, orders_helper_1.updateOrderRequest)(nonExistentOrderId, updateData, adminCookie);
            expect(res.status).toBe(404);
        }));
    });
    describe("should return 200, if", () => {
        it("admin successfully updates order payment method", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { paymentMethod: "PayPal" };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.order).toBeDefined();
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order);
            expect(res.body.data.order.paymentMethod).toBe("PayPal");
        }));
        it("admin successfully updates order items", () => __awaiter(void 0, void 0, void 0, function* () {
            const newProduct = yield (0, orders_helper_1.createTestProduct)();
            const updateData = {
                orderItems: [
                    {
                        productId: newProduct._id.toString(),
                        qty: 5,
                    },
                ],
            };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order.orderItems).toHaveLength(1);
            expect(res.body.data.order.orderItems[0].qty).toBe(5);
        }));
        it("admin successfully updates shipping address", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                shippingAddress: {
                    province: "Isfahan",
                    city: "Isfahan",
                    street: "Chahar Bagh Street, No. 456",
                },
            };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order.shippingAddress.province).toBe("Isfahan");
            expect(res.body.data.order.shippingAddress.city).toBe("Isfahan");
            expect(res.body.data.order.shippingAddress.street).toBe("Chahar Bagh Street, No. 456");
        }));
        it("admin successfully updates pricing information", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                itemsPrice: 50000,
                shippingPrice: 8000,
                taxPrice: 5000,
                totalPrice: 63000,
            };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order.itemsPrice).toBe(50000);
            expect(res.body.data.order.shippingPrice).toBe(8000);
            expect(res.body.data.order.taxPrice).toBe(5000);
            expect(res.body.data.order.totalPrice).toBe(63000);
        }));
        it("admin successfully updates multiple fields at once", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                paymentMethod: "Bank Transfer",
                itemsPrice: 35000,
                totalPrice: 42000,
                shippingAddress: {
                    province: "Shiraz",
                    city: "Shiraz",
                    street: "Zand Street, No. 789",
                },
            };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order.paymentMethod).toBe("Bank Transfer");
            expect(res.body.data.order.itemsPrice).toBe(35000);
            expect(res.body.data.order.totalPrice).toBe(42000);
            expect(res.body.data.order.shippingAddress.province).toBe("Shiraz");
        }));
        it("admin update preserves unchanged fields", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalPaymentMethod = order.paymentMethod;
            const originalItemsPrice = order.itemsPrice;
            const updateData = { shippingPrice: 7000 };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order.paymentMethod).toBe(originalPaymentMethod);
            expect(res.body.data.order.itemsPrice).toBe(originalItemsPrice);
            expect(res.body.data.order.shippingPrice).toBe(7000);
        }));
        it("admin update updates the updatedAt timestamp", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalUpdatedAt = order.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 10));
            const updateData = { paymentMethod: "Cash" };
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(200);
            expect(new Date(res.body.data.order.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
        }));
        it("admin can update order with empty update data", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {};
            const res = yield (0, orders_helper_1.updateOrderRequest)(order._id.toString(), updateData, adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order).toBeDefined();
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order);
        }));
    });
});
