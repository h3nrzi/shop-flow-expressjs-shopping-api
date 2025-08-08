import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	updateOrderToDeliverRequest,
	createTestUserAndGetCookie,
	createTestOrder,
	getInvalidId,
	getInvalidObjectId,
	expectValidOrderResponse,
	expectOrderStatusUpdate,
} from "@/__tests__/helpers/orders.helper";

describe("PATCH /api/orders/:id/deliver (Admin Only)", () => {
	let userCookie: string;
	let adminCookie: string;
	let user: any;
	let order: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("orderuser");
		userCookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestUserAndGetCookie("admin", "admin");
		adminCookie = testAdmin.cookie;

		// Create a test order for the user
		order = await createTestOrder(user._id.toString());
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await updateOrderToDeliverRequest(order._id.toString());

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await updateOrderToDeliverRequest(
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
			const res = await updateOrderToDeliverRequest(
				getInvalidId(),
				adminCookie,
			);

			expect(res.status).toBe(400);
		});
	});

	describe("should return 403, if", () => {
		it("regular user tries to access admin endpoint", async () => {
			const res = await updateOrderToDeliverRequest(
				order._id.toString(),
				userCookie,
			);

			expect(res.status).toBe(403);
		});
	});

	describe("should return 404, if", () => {
		it("order does not exist", async () => {
			const nonExistentOrderId = getInvalidObjectId();
			const res = await updateOrderToDeliverRequest(
				nonExistentOrderId,
				adminCookie,
			);

			expect(res.status).toBe(404);
		});
	});

	describe("should return 200, if", () => {
		it("admin successfully updates order to delivered", async () => {
			const res = await updateOrderToDeliverRequest(
				order._id.toString(),
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.order).toBeDefined();
			expectValidOrderResponse(res.body.data.order);
			expectOrderStatusUpdate(res.body.data.order, undefined, true);
			expect(res.body.data.order.id).toBe(order._id.toString());
		});

		it("admin can update any user's order to delivered", async () => {
			// Create another user and their order
			const otherUser = await createTestUserAndGetCookie("otheruser");
			const otherOrder = await createTestOrder(otherUser.user._id.toString());

			const res = await updateOrderToDeliverRequest(
				otherOrder._id.toString(),
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.order).toBeDefined();
			expectValidOrderResponse(res.body.data.order);
			expectOrderStatusUpdate(res.body.data.order, undefined, true);
		});

		it("order is marked as delivered with deliveredAt timestamp", async () => {
			const beforeUpdate = new Date();
			const res = await updateOrderToDeliverRequest(
				order._id.toString(),
				adminCookie,
			);
			const afterUpdate = new Date();

			expect(res.status).toBe(200);
			const updatedOrder = res.body.data.order;
			expect(updatedOrder.isDelivered).toBe(true);
			expect(updatedOrder.deliveredAt).toBeDefined();

			const deliveredAtDate = new Date(updatedOrder.deliveredAt);
			expect(deliveredAtDate.getTime()).toBeGreaterThanOrEqual(
				beforeUpdate.getTime(),
			);
			expect(deliveredAtDate.getTime()).toBeLessThanOrEqual(
				afterUpdate.getTime(),
			);
		});

		it("order retains all other properties after delivery update", async () => {
			const res = await updateOrderToDeliverRequest(
				order._id.toString(),
				adminCookie,
			);

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
			expect(updatedOrder.isPaid).toBe(false); // Should remain unchanged
		});

		it("already delivered order can be updated again", async () => {
			// First update to delivered
			await updateOrderToDeliverRequest(order._id.toString(), adminCookie);

			// Second update to delivered
			const res = await updateOrderToDeliverRequest(
				order._id.toString(),
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.data.order.isDelivered).toBe(true);
			expect(res.body.data.order.deliveredAt).toBeDefined();
		});

		it("updatedAt timestamp is updated", async () => {
			const originalUpdatedAt = order.updatedAt;

			// Wait a moment to ensure timestamp difference
			await new Promise((resolve) => setTimeout(resolve, 10));

			const res = await updateOrderToDeliverRequest(
				order._id.toString(),
				adminCookie,
			);

			expect(res.status).toBe(200);
			const updatedOrder = res.body.data.order;
			expect(new Date(updatedOrder.updatedAt).getTime()).toBeGreaterThan(
				new Date(originalUpdatedAt).getTime(),
			);
		});

		it("admin can deliver orders from different users", async () => {
			// Create orders for multiple users
			const user2 = await createTestUserAndGetCookie("user2");
			const user3 = await createTestUserAndGetCookie("user3");

			const order2 = await createTestOrder(user2.user._id.toString());
			const order3 = await createTestOrder(user3.user._id.toString());

			// Admin can deliver all orders
			const res1 = await updateOrderToDeliverRequest(
				order._id.toString(),
				adminCookie,
			);
			expect(res1.status).toBe(200);
			expect(res1.body.data.order.isDelivered).toBe(true);

			const res2 = await updateOrderToDeliverRequest(
				order2._id.toString(),
				adminCookie,
			);
			expect(res2.status).toBe(200);
			expect(res2.body.data.order.isDelivered).toBe(true);

			const res3 = await updateOrderToDeliverRequest(
				order3._id.toString(),
				adminCookie,
			);
			expect(res3.status).toBe(200);
			expect(res3.body.data.order.isDelivered).toBe(true);
		});

		it("admin can deliver orders with different payment statuses", async () => {
			// Create orders with different payment statuses
			const unpaidOrder = await createTestOrder(user._id.toString());

			// Deliver unpaid order
			const res1 = await updateOrderToDeliverRequest(
				unpaidOrder._id.toString(),
				adminCookie,
			);
			expect(res1.status).toBe(200);
			expect(res1.body.data.order.isDelivered).toBe(true);
			expect(res1.body.data.order.isPaid).toBe(false);
		});

		it("delivery update preserves order items and shipping information", async () => {
			const res = await updateOrderToDeliverRequest(
				order._id.toString(),
				adminCookie,
			);

			expect(res.status).toBe(200);
			const updatedOrder = res.body.data.order;

			// Check that order items are preserved
			expect(updatedOrder.orderItems).toBeDefined();
			expect(Array.isArray(updatedOrder.orderItems)).toBe(true);
			expect(updatedOrder.orderItems.length).toBeGreaterThan(0);

			// Check that shipping address is preserved
			expect(updatedOrder.shippingAddress).toBeDefined();
			expect(updatedOrder.shippingAddress.province).toBeDefined();
			expect(updatedOrder.shippingAddress.city).toBeDefined();
			expect(updatedOrder.shippingAddress.street).toBeDefined();
		});

		it("admin can deliver multiple orders in sequence", async () => {
			// Create multiple orders
			const order2 = await createTestOrder(user._id.toString());
			const order3 = await createTestOrder(user._id.toString());

			// Deliver orders in sequence
			const res1 = await updateOrderToDeliverRequest(
				order._id.toString(),
				adminCookie,
			);
			expect(res1.status).toBe(200);

			const res2 = await updateOrderToDeliverRequest(
				order2._id.toString(),
				adminCookie,
			);
			expect(res2.status).toBe(200);

			const res3 = await updateOrderToDeliverRequest(
				order3._id.toString(),
				adminCookie,
			);
			expect(res3.status).toBe(200);

			// All orders should be delivered
			expect(res1.body.data.order.isDelivered).toBe(true);
			expect(res2.body.data.order.isDelivered).toBe(true);
			expect(res3.body.data.order.isDelivered).toBe(true);
		});
	});
});
