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
describe("PATCH /api/orders/:id/deliver (Admin Only)", () => {
    let userCookie;
    let adminCookie;
    let user;
    let order;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("orderuser");
        userCookie = testUser.cookie;
        user = testUser.user;
        const testAdmin = yield (0, orders_helper_1.createTestUserAndGetCookie)("admin", "admin");
        adminCookie = testAdmin.cookie;
        order = yield (0, orders_helper_1.createTestOrder)(user._id.toString());
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString());
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("order ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)((0, orders_helper_1.getInvalidId)(), adminCookie);
            expect(res.status).toBe(400);
        }));
    });
    describe("should return 403, if", () => {
        it("regular user tries to access admin endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), userCookie);
            expect(res.status).toBe(403);
        }));
    });
    describe("should return 404, if", () => {
        it("order does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentOrderId = (0, orders_helper_1.getInvalidObjectId)();
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(nonExistentOrderId, adminCookie);
            expect(res.status).toBe(404);
        }));
    });
    describe("should return 200, if", () => {
        it("admin successfully updates order to delivered", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.order).toBeDefined();
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order);
            (0, orders_helper_1.expectOrderStatusUpdate)(res.body.data.order, undefined, true);
            expect(res.body.data.order.id).toBe(order._id.toString());
        }));
        it("admin can update any user's order to delivered", () => __awaiter(void 0, void 0, void 0, function* () {
            const otherUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("otheruser");
            const otherOrder = yield (0, orders_helper_1.createTestOrder)(otherUser.user._id.toString());
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(otherOrder._id.toString(), adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.order).toBeDefined();
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order);
            (0, orders_helper_1.expectOrderStatusUpdate)(res.body.data.order, undefined, true);
        }));
        it("order is marked as delivered with deliveredAt timestamp", () => __awaiter(void 0, void 0, void 0, function* () {
            const beforeUpdate = new Date();
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), adminCookie);
            const afterUpdate = new Date();
            expect(res.status).toBe(200);
            const updatedOrder = res.body.data.order;
            expect(updatedOrder.isDelivered).toBe(true);
            expect(updatedOrder.deliveredAt).toBeDefined();
            const deliveredAtDate = new Date(updatedOrder.deliveredAt);
            expect(deliveredAtDate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
            expect(deliveredAtDate.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
        }));
        it("order retains all other properties after delivery update", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), adminCookie);
            expect(res.status).toBe(200);
            const updatedOrder = res.body.data.order;
            expect(updatedOrder.user).toBe(user._id.toString());
            expect(updatedOrder.orderItems).toBeDefined();
            expect(updatedOrder.shippingAddress).toBeDefined();
            expect(updatedOrder.paymentMethod).toBeDefined();
            expect(updatedOrder.itemsPrice).toBeDefined();
            expect(updatedOrder.shippingPrice).toBeDefined();
            expect(updatedOrder.taxPrice).toBeDefined();
            expect(updatedOrder.totalPrice).toBeDefined();
            expect(updatedOrder.isPaid).toBe(false);
        }));
        it("already delivered order can be updated again", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), adminCookie);
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order.isDelivered).toBe(true);
            expect(res.body.data.order.deliveredAt).toBeDefined();
        }));
        it("updatedAt timestamp is updated", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalUpdatedAt = order.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 10));
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), adminCookie);
            expect(res.status).toBe(200);
            const updatedOrder = res.body.data.order;
            expect(new Date(updatedOrder.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
        }));
        it("admin can deliver orders from different users", () => __awaiter(void 0, void 0, void 0, function* () {
            const user2 = yield (0, orders_helper_1.createTestUserAndGetCookie)("user2");
            const user3 = yield (0, orders_helper_1.createTestUserAndGetCookie)("user3");
            const order2 = yield (0, orders_helper_1.createTestOrder)(user2.user._id.toString());
            const order3 = yield (0, orders_helper_1.createTestOrder)(user3.user._id.toString());
            const res1 = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), adminCookie);
            expect(res1.status).toBe(200);
            expect(res1.body.data.order.isDelivered).toBe(true);
            const res2 = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order2._id.toString(), adminCookie);
            expect(res2.status).toBe(200);
            expect(res2.body.data.order.isDelivered).toBe(true);
            const res3 = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order3._id.toString(), adminCookie);
            expect(res3.status).toBe(200);
            expect(res3.body.data.order.isDelivered).toBe(true);
        }));
        it("admin can deliver orders with different payment statuses", () => __awaiter(void 0, void 0, void 0, function* () {
            const unpaidOrder = yield (0, orders_helper_1.createTestOrder)(user._id.toString());
            const res1 = yield (0, orders_helper_1.updateOrderToDeliverRequest)(unpaidOrder._id.toString(), adminCookie);
            expect(res1.status).toBe(200);
            expect(res1.body.data.order.isDelivered).toBe(true);
            expect(res1.body.data.order.isPaid).toBe(false);
        }));
        it("delivery update preserves order items and shipping information", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), adminCookie);
            expect(res.status).toBe(200);
            const updatedOrder = res.body.data.order;
            expect(updatedOrder.orderItems).toBeDefined();
            expect(Array.isArray(updatedOrder.orderItems)).toBe(true);
            expect(updatedOrder.orderItems.length).toBeGreaterThan(0);
            expect(updatedOrder.shippingAddress).toBeDefined();
            expect(updatedOrder.shippingAddress.province).toBeDefined();
            expect(updatedOrder.shippingAddress.city).toBeDefined();
            expect(updatedOrder.shippingAddress.street).toBeDefined();
        }));
        it("admin can deliver multiple orders in sequence", () => __awaiter(void 0, void 0, void 0, function* () {
            const order2 = yield (0, orders_helper_1.createTestOrder)(user._id.toString());
            const order3 = yield (0, orders_helper_1.createTestOrder)(user._id.toString());
            const res1 = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order._id.toString(), adminCookie);
            expect(res1.status).toBe(200);
            const res2 = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order2._id.toString(), adminCookie);
            expect(res2.status).toBe(200);
            const res3 = yield (0, orders_helper_1.updateOrderToDeliverRequest)(order3._id.toString(), adminCookie);
            expect(res3.status).toBe(200);
            expect(res1.body.data.order.isDelivered).toBe(true);
            expect(res2.body.data.order.isDelivered).toBe(true);
            expect(res3.body.data.order.isDelivered).toBe(true);
        }));
    });
});
