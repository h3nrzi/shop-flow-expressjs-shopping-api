import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	updateOrderToPaidRequest,
	createTestUserAndGetCookie,
	createTestOrder,
	getInvalidId,
	getInvalidObjectId,
	expectValidOrderResponse,
	expectOrderStatusUpdate,
} from "@/__tests__/helpers/orders.helper";

describe("PATCH /api/orders/:id/pay", () => {
	let cookie: string;
	let adminCookie: string;
	let user: any;
	let order: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("orderuser");
		cookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestUserAndGetCookie("admin", "admin");
		adminCookie = testAdmin.cookie;

		// Create a test order for the user
		order = await createTestOrder(user._id.toString());
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await updateOrderToPaidRequest(order._id.toString());

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await updateOrderToPaidRequest(
				order._id.toString(),
				invalidCookie,
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!",
			);
		});
	});

	describe("should return 400, if", () => {
		it("order ID is not a valid ObjectId", async () => {
			const res = await updateOrderToPaidRequest(getInvalidId(), cookie);

			expect(res.status).toBe(400);
		});
	});

	describe("should return 403, if", () => {
		it("user tries to update another user's order", async () => {
			// Create another user and their order
			const otherUser = await createTestUserAndGetCookie("otheruser");
			const otherOrder = await createTestOrder(otherUser.user._id.toString());

			const res = await updateOrderToPaidRequest(
				otherOrder._id.toString(),
				cookie,
			);

			expect(res.status).toBe(403);
		});
	});

	describe("should return 404, if", () => {
		it("order does not exist", async () => {
			const nonExistentOrderId = getInvalidObjectId();
			const res = await updateOrderToPaidRequest(nonExistentOrderId, cookie);

			expect(res.status).toBe(404);
		});
	});

	describe("should return 200, if", () => {
		it("user successfully updates their own order to paid", async () => {
			const res = await updateOrderToPaidRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.order).toBeDefined();
			expectValidOrderResponse(res.body.data.order);
			expectOrderStatusUpdate(res.body.data.order, true);
			expect(res.body.data.order.id).toBe(order._id.toString());
		});

		it("admin can update any user's order to paid", async () => {
			const res = await updateOrderToPaidRequest(
				order._id.toString(),
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.order).toBeDefined();
			expectValidOrderResponse(res.body.data.order);
			expectOrderStatusUpdate(res.body.data.order, true);
		});

		it("order is marked as paid with paidAt timestamp", async () => {
			const beforeUpdate = new Date();
			const res = await updateOrderToPaidRequest(order._id.toString(), cookie);
			const afterUpdate = new Date();

			expect(res.status).toBe(200);
			const updatedOrder = res.body.data.order;
			expect(updatedOrder.isPaid).toBe(true);
			expect(updatedOrder.paidAt).toBeDefined();

			const paidAtDate = new Date(updatedOrder.paidAt);
			expect(paidAtDate.getTime()).toBeGreaterThanOrEqual(
				beforeUpdate.getTime(),
			);
			expect(paidAtDate.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
		});

		it("order retains all other properties after payment update", async () => {
			const res = await updateOrderToPaidRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			const updatedOrder = res.body.data.order;

			// Check that all original order properties are preserved
			expect(updatedOrder.user).toBe(user._id.toString());
			expect(updatedOrder.orderItems).toBeDefined();
			expect(updatedOrder.shippingAddress).toBeDefined();
			expect(updatedOrder.paymentMethod).toBeDefined();
			expect(updatedOrder.itemsPrice).toBeDefined();
			expect(updatedOrder.shippingPrice).toBeDefined();
			expect(updatedOrder.taxPrice).toBeDefined();
			expect(updatedOrder.totalPrice).toBeDefined();
			expect(updatedOrder.isDelivered).toBe(false); // Should remain unchanged
		});

		it("already paid order can be updated again", async () => {
			// First update to paid
			await updateOrderToPaidRequest(order._id.toString(), cookie);

			// Second update to paid
			const res = await updateOrderToPaidRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			expect(res.body.data.order.isPaid).toBe(true);
			expect(res.body.data.order.paidAt).toBeDefined();
		});

		it("updatedAt timestamp is updated", async () => {
			const originalUpdatedAt = order.updatedAt;

			// Wait a moment to ensure timestamp difference
			await new Promise((resolve) => setTimeout(resolve, 10));

			const res = await updateOrderToPaidRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			const updatedOrder = res.body.data.order;
			expect(new Date(updatedOrder.updatedAt).getTime()).toBeGreaterThan(
				new Date(originalUpdatedAt).getTime(),
			);
		});
	});
});
