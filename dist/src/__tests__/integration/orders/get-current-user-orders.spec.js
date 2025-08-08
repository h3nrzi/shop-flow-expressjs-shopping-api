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
describe("GET /api/orders/get-myorders", () => {
    let cookie;
    let user;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("orderuser");
        cookie = testUser.cookie;
        user = testUser.user;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getCurrentUserOrdersRequest)();
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, orders_helper_1.getCurrentUserOrdersRequest)(invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 200, if", () => {
        it("user has no orders", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.getCurrentUserOrdersRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.length).toBe(0);
            expect(res.body.data.orders).toEqual([]);
        }));
        it("user has orders", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 3);
            const res = yield (0, orders_helper_1.getCurrentUserOrdersRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.length).toBe(3);
            expect(res.body.data.orders).toHaveLength(3);
            res.body.data.orders.forEach((order) => {
                (0, orders_helper_1.expectValidOrderResponse)(order);
                expect(order.user).toBe(user._id.toString());
            });
        }));
        it("user only sees their own orders", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 2);
            const otherUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("otheruser");
            yield (0, orders_helper_1.createMultipleTestOrders)(otherUser.user._id.toString(), 3);
            const res = yield (0, orders_helper_1.getCurrentUserOrdersRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.length).toBe(2);
            expect(res.body.data.orders).toHaveLength(2);
            res.body.data.orders.forEach((order) => {
                expect(order.user).toBe(user._id.toString());
            });
        }));
        it("orders are returned with correct structure", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            const res = yield (0, orders_helper_1.getCurrentUserOrdersRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.length).toBe(1);
            expect(res.body.data.orders).toHaveLength(1);
            const order = res.body.data.orders[0];
            (0, orders_helper_1.expectValidOrderResponse)(order);
            expect(order.orderItems).toBeDefined();
            expect(Array.isArray(order.orderItems)).toBe(true);
            expect(order.orderItems.length).toBeGreaterThan(0);
        }));
        it("orders are sorted by creation date (newest first)", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            yield new Promise((resolve) => setTimeout(resolve, 10));
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            yield new Promise((resolve) => setTimeout(resolve, 10));
            yield (0, orders_helper_1.createMultipleTestOrders)(user._id.toString(), 1);
            const res = yield (0, orders_helper_1.getCurrentUserOrdersRequest)(cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(3);
            const orders = res.body.data.orders;
            for (let i = 0; i < orders.length - 1; i++) {
                const currentOrderDate = new Date(orders[i].createdAt);
                const nextOrderDate = new Date(orders[i + 1].createdAt);
                expect(currentOrderDate.getTime()).toBeGreaterThanOrEqual(nextOrderDate.getTime());
            }
        }));
    });
});
