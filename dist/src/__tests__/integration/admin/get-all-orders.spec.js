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
describe("GET /api/orders (Admin Only)", () => {
    let userCookie;
    let adminCookie;
    let user;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("orderuser");
        userCookie = testUser.cookie;
        user = testUser.user;
        const testAdmin = yield (0, orders_helper_1.createTestUserAndGetCookie)("admin", "admin");
        adminCookie = testAdmin.cookie;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getAllOrdersRequest)();
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, orders_helper_1.getAllOrdersRequest)(invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 403, if", () => {
        it("regular user tries to access admin endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getAllOrdersRequest)(userCookie);
            expect(res.status).toBe(403);
        }));
    });
    describe("should return 200, if", () => {
        it("admin accesses endpoint with no orders", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getAllOrdersRequest)(adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.length).toBe(0);
            expect(res.body.data.orders).toEqual([]);
        }));
        it("admin gets all orders from all users", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 2);
            const user2 = yield (0, orders_helper_1.createTestUserAndGetCookie)("user2");
            yield (0, orders_helper_1.createMultipleTestOrders)(user2.user._id.toString(), 3);
            const res = yield (0, orders_helper_1.getAllOrdersRequest)(adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.length).toBe(5);
            expect(res.body.data.orders).toHaveLength(5);
            res.body.data.orders.forEach((order) => {
                (0, orders_helper_1.expectValidOrderResponse)(order);
            });
            const userIds = res.body.data.orders.map((order) => order.user);
            expect(userIds).toContain(user._id.toString());
            expect(userIds).toContain(user2.user._id.toString());
        }));
        it("admin gets orders with complete information", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            const res = yield (0, orders_helper_1.getAllOrdersRequest)(adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(1);
            const order = res.body.data.orders[0];
            (0, orders_helper_1.expectValidOrderResponse)(order);
            expect(order.user).toBeDefined();
            expect(order.orderItems).toBeDefined();
            expect(Array.isArray(order.orderItems)).toBe(true);
            expect(order.shippingAddress).toBeDefined();
            expect(order.paymentMethod).toBeDefined();
            expect(order.itemsPrice).toBeDefined();
            expect(order.shippingPrice).toBeDefined();
            expect(order.taxPrice).toBeDefined();
            expect(order.totalPrice).toBeDefined();
            expect(order.isPaid).toBeDefined();
            expect(order.isDelivered).toBeDefined();
            expect(order.createdAt).toBeDefined();
            expect(order.updatedAt).toBeDefined();
        }));
        it("admin gets orders sorted by creation date (newest first)", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            yield new Promise(resolve => setTimeout(resolve, 10));
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            yield new Promise(resolve => setTimeout(resolve, 10));
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            const res = yield (0, orders_helper_1.getAllOrdersRequest)(adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(3);
            const orders = res.body.data.orders;
            for (let i = 0; i < orders.length - 1; i++) {
                const currentOrderDate = new Date(orders[i].createdAt);
                const nextOrderDate = new Date(orders[i + 1].createdAt);
                expect(currentOrderDate.getTime()).toBeGreaterThanOrEqual(nextOrderDate.getTime());
            }
        }));
        it("admin gets orders with populated user information", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            const res = yield (0, orders_helper_1.getAllOrdersRequest)(adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(1);
            const order = res.body.data.orders[0];
            expect(order.user).toBe(user._id.toString());
        }));
        it("admin gets orders with populated product information", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            const res = yield (0, orders_helper_1.getAllOrdersRequest)(adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(1);
            const order = res.body.data.orders[0];
            expect(order.orderItems).toBeDefined();
            expect(Array.isArray(order.orderItems)).toBe(true);
            expect(order.orderItems.length).toBeGreaterThan(0);
            const orderItem = order.orderItems[0];
            expect(orderItem.product).toBeDefined();
            expect(orderItem.qty).toBeDefined();
        }));
        it("admin gets orders from multiple users with different statuses", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            const user2 = yield (0, orders_helper_1.createTestUserAndGetCookie)("user2");
            yield (0, orders_helper_1.createMultipleTestOrders)(user2.user._id.toString(), 1);
            const res = yield (0, orders_helper_1.getAllOrdersRequest)(adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(2);
            res.body.data.orders.forEach((order) => {
                expect(order.isPaid).toBe(false);
                expect(order.isDelivered).toBe(false);
            });
        }));
    });
});
