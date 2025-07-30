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
describe("GET /api/orders/:id", () => {
    let cookie;
    let adminCookie;
    let user;
    let order;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("orderuser");
        cookie = testUser.cookie;
        user = testUser.user;
        const testAdmin = yield (0, orders_helper_1.createTestUserAndGetCookie)("admin", "admin");
        adminCookie = testAdmin.cookie;
        order = yield (0, orders_helper_1.createTestOrder)(user._id.toString());
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(order._id.toString());
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(order._id.toString(), invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("order ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getOrderByIdRequest)((0, orders_helper_1.getInvalidId)(), cookie);
            expect(res.status).toBe(400);
        }));
    });
    describe("should return 403, if", () => {
        it("user tries to access another user's order", () => __awaiter(void 0, void 0, void 0, function* () {
            const otherUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("otheruser");
            const otherOrder = yield (0, orders_helper_1.createTestOrder)(otherUser.user._id.toString());
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(otherOrder._id.toString(), cookie);
            expect(res.status).toBe(403);
        }));
    });
    describe("should return 404, if", () => {
        it("order does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentOrderId = (0, orders_helper_1.getInvalidObjectId)();
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(nonExistentOrderId, cookie);
            expect(res.status).toBe(404);
        }));
    });
    describe("should return 200, if", () => {
        it("user accesses their own order", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(order._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.order).toBeDefined();
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order);
            expect(res.body.data.order.id).toBe(order._id.toString());
            expect(res.body.data.order.user).toBe(user._id.toString());
        }));
        it("admin can access any user's order", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(order._id.toString(), adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.order).toBeDefined();
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order);
            expect(res.body.data.order.id).toBe(order._id.toString());
        }));
        it("order contains populated product information", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(order._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order.orderItems).toBeDefined();
            expect(Array.isArray(res.body.data.order.orderItems)).toBe(true);
            expect(res.body.data.order.orderItems.length).toBeGreaterThan(0);
            const orderItem = res.body.data.order.orderItems[0];
            expect(orderItem.product).toBeDefined();
            expect(orderItem.qty).toBeDefined();
        }));
        it("order contains user information", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(order._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order.user).toBeDefined();
        }));
        it("order contains complete shipping address", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(order._id.toString(), cookie);
            expect(res.status).toBe(200);
            const shippingAddress = res.body.data.order.shippingAddress;
            expect(shippingAddress).toBeDefined();
            expect(shippingAddress.province).toBeDefined();
            expect(shippingAddress.city).toBeDefined();
            expect(shippingAddress.street).toBeDefined();
        }));
        it("order contains payment and pricing information", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(order._id.toString(), cookie);
            expect(res.status).toBe(200);
            const orderData = res.body.data.order;
            expect(orderData.paymentMethod).toBeDefined();
            expect(orderData.itemsPrice).toBeDefined();
            expect(orderData.shippingPrice).toBeDefined();
            expect(orderData.taxPrice).toBeDefined();
            expect(orderData.totalPrice).toBeDefined();
            expect(orderData.isPaid).toBeDefined();
            expect(orderData.isDelivered).toBeDefined();
        }));
        it("order contains timestamps", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getOrderByIdRequest)(order._id.toString(), cookie);
            expect(res.status).toBe(200);
            const orderData = res.body.data.order;
            expect(orderData.createdAt).toBeDefined();
            expect(orderData.updatedAt).toBeDefined();
        }));
    });
});
