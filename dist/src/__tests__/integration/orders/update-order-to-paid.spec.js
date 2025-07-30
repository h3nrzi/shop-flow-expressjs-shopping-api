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
describe("PATCH /api/orders/:id/pay", () => {
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
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(order._id.toString());
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(order._id.toString(), invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("order ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)((0, orders_helper_1.getInvalidId)(), cookie);
            expect(res.status).toBe(400);
        }));
    });
    describe("should return 403, if", () => {
        it("user tries to update another user's order", () => __awaiter(void 0, void 0, void 0, function* () {
            const otherUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("otheruser");
            const otherOrder = yield (0, orders_helper_1.createTestOrder)(otherUser.user._id.toString());
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(otherOrder._id.toString(), cookie);
            expect(res.status).toBe(403);
        }));
    });
    describe("should return 404, if", () => {
        it("order does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentOrderId = (0, orders_helper_1.getInvalidObjectId)();
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(nonExistentOrderId, cookie);
            expect(res.status).toBe(404);
        }));
    });
    describe("should return 200, if", () => {
        it("user successfully updates their own order to paid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(order._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.order).toBeDefined();
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order);
            (0, orders_helper_1.expectOrderStatusUpdate)(res.body.data.order, true);
            expect(res.body.data.order.id).toBe(order._id.toString());
        }));
        it("admin can update any user's order to paid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(order._id.toString(), adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.order).toBeDefined();
            (0, orders_helper_1.expectValidOrderResponse)(res.body.data.order);
            (0, orders_helper_1.expectOrderStatusUpdate)(res.body.data.order, true);
        }));
        it("order is marked as paid with paidAt timestamp", () => __awaiter(void 0, void 0, void 0, function* () {
            const beforeUpdate = new Date();
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(order._id.toString(), cookie);
            const afterUpdate = new Date();
            expect(res.status).toBe(200);
            const updatedOrder = res.body.data.order;
            expect(updatedOrder.isPaid).toBe(true);
            expect(updatedOrder.paidAt).toBeDefined();
            const paidAtDate = new Date(updatedOrder.paidAt);
            expect(paidAtDate.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
            expect(paidAtDate.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
        }));
        it("order retains all other properties after payment update", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(order._id.toString(), cookie);
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
            expect(updatedOrder.isDelivered).toBe(false);
        }));
        it("already paid order can be updated again", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.updateOrderToPaidRequest)(order._id.toString(), cookie);
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(order._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.order.isPaid).toBe(true);
            expect(res.body.data.order.paidAt).toBeDefined();
        }));
        it("updatedAt timestamp is updated", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalUpdatedAt = order.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 10));
            const res = yield (0, orders_helper_1.updateOrderToPaidRequest)(order._id.toString(), cookie);
            expect(res.status).toBe(200);
            const updatedOrder = res.body.data.order;
            expect(new Date(updatedOrder.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
        }));
    });
});
