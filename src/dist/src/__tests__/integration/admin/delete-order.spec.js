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
describe("DELETE /api/orders/:id (Admin Only)", () => {
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
            const res = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString());
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString(), invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("order ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.deleteOrderRequest)((0, orders_helper_1.getInvalidId)(), adminCookie);
            expect(res.status).toBe(400);
        }));
    });
    describe("should return 403, if", () => {
        it("regular user tries to access admin endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString(), userCookie);
            expect(res.status).toBe(403);
        }));
    });
    describe("should return 404, if", () => {
        it("order does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentOrderId = (0, orders_helper_1.getInvalidObjectId)();
            const res = yield (0, orders_helper_1.deleteOrderRequest)(nonExistentOrderId, adminCookie);
            expect(res.status).toBe(404);
        }));
    });
    describe("should return 204, if", () => {
        it("admin successfully deletes order", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString(), adminCookie);
            expect(res.status).toBe(204);
            expect(res.body.status).toBe("success");
        }));
        it("admin can delete any user's order", () => __awaiter(void 0, void 0, void 0, function* () {
            const otherUser = yield (0, orders_helper_1.createTestUserAndGetCookie)("otheruser");
            const otherOrder = yield (0, orders_helper_1.createTestOrder)(otherUser.user._id.toString());
            const res = yield (0, orders_helper_1.deleteOrderRequest)(otherOrder._id.toString(), adminCookie);
            expect(res.status).toBe(204);
            expect(res.body.status).toBe("success");
        }));
        it("deleting non-existent order after successful deletion returns 404", () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteRes = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString(), adminCookie);
            expect(deleteRes.status).toBe(204);
            const secondDeleteRes = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString(), adminCookie);
            expect(secondDeleteRes.status).toBe(404);
        }));
        it("admin can delete multiple orders", () => __awaiter(void 0, void 0, void 0, function* () {
            const order2 = yield (0, orders_helper_1.createTestOrder)(user._id.toString());
            const order3 = yield (0, orders_helper_1.createTestOrder)(user._id.toString());
            const res1 = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString(), adminCookie);
            expect(res1.status).toBe(204);
            const res2 = yield (0, orders_helper_1.deleteOrderRequest)(order2._id.toString(), adminCookie);
            expect(res2.status).toBe(204);
            const res3 = yield (0, orders_helper_1.deleteOrderRequest)(order3._id.toString(), adminCookie);
            expect(res3.status).toBe(204);
        }));
        it("admin can delete orders with different statuses", () => __awaiter(void 0, void 0, void 0, function* () {
            const paidOrder = yield (0, orders_helper_1.createTestOrder)(user._id.toString(), undefined, {
                itemsPrice: 50000,
                totalPrice: 60000,
            });
            const deliveredOrder = yield (0, orders_helper_1.createTestOrder)(user._id.toString(), undefined, {
                itemsPrice: 30000,
                totalPrice: 35000,
            });
            const res1 = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString(), adminCookie);
            expect(res1.status).toBe(204);
            const res2 = yield (0, orders_helper_1.deleteOrderRequest)(paidOrder._id.toString(), adminCookie);
            expect(res2.status).toBe(204);
            const res3 = yield (0, orders_helper_1.deleteOrderRequest)(deliveredOrder._id.toString(), adminCookie);
            expect(res3.status).toBe(204);
        }));
        it("response body contains success status", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString(), adminCookie);
            expect(res.status).toBe(204);
            expect(res.body).toEqual({
                status: "success",
            });
        }));
        it("admin can delete order immediately after creation", () => __awaiter(void 0, void 0, void 0, function* () {
            const newOrder = yield (0, orders_helper_1.createTestOrder)(user._id.toString());
            const res = yield (0, orders_helper_1.deleteOrderRequest)(newOrder._id.toString(), adminCookie);
            expect(res.status).toBe(204);
            expect(res.body.status).toBe("success");
        }));
        it("admin can delete orders from different users", () => __awaiter(void 0, void 0, void 0, function* () {
            const user2 = yield (0, orders_helper_1.createTestUserAndGetCookie)("user2");
            const user3 = yield (0, orders_helper_1.createTestUserAndGetCookie)("user3");
            const order2 = yield (0, orders_helper_1.createTestOrder)(user2.user._id.toString());
            const order3 = yield (0, orders_helper_1.createTestOrder)(user3.user._id.toString());
            const res1 = yield (0, orders_helper_1.deleteOrderRequest)(order._id.toString(), adminCookie);
            expect(res1.status).toBe(204);
            const res2 = yield (0, orders_helper_1.deleteOrderRequest)(order2._id.toString(), adminCookie);
            expect(res2.status).toBe(204);
            const res3 = yield (0, orders_helper_1.deleteOrderRequest)(order3._id.toString(), adminCookie);
            expect(res3.status).toBe(204);
        }));
    });
});
