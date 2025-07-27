import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	getCurrentUserOrdersRequest,
	createTestUserAndGetCookie,
	createMultipleTestOrders,
	expectValidOrderResponse,
} from "@/__tests__/helpers/orders.helper";

describe("GET /api/orders/get-myorders", () => {
	let cookie: string;
	let user: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie(
			"orderuser"
		);
		cookie = testUser.cookie;
		user = testUser.user;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await getCurrentUserOrdersRequest();

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await getCurrentUserOrdersRequest(
				invalidCookie
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!"
			);
		});
	});

	describe("should return 200, if", () => {
		it("user has no orders", async () => {
			const res = await getCurrentUserOrdersRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.length).toBe(0);
			expect(res.body.data.orders).toEqual([]);
		});

		it("user has orders", async () => {
			// Create test orders for the user
			await createMultipleTestOrders(user._id.toString(), 3);

			const res = await getCurrentUserOrdersRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.length).toBe(3);
			expect(res.body.data.orders).toHaveLength(3);

			// Validate each order structure
			res.body.data.orders.forEach((order: any) => {
				expectValidOrderResponse(order);
				expect(order.user).toBe(user._id.toString());
			});
		});

		it("user only sees their own orders", async () => {
			// Create orders for the current user
			await createMultipleTestOrders(user._id.toString(), 2);

			// Create another user and their orders
			const otherUser = await createTestUserAndGetCookie(
				"otheruser"
			);
			await createMultipleTestOrders(
				otherUser.user._id.toString(),
				3
			);

			const res = await getCurrentUserOrdersRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.length).toBe(2);
			expect(res.body.data.orders).toHaveLength(2);

			// Verify all orders belong to the current user
			res.body.data.orders.forEach((order: any) => {
				expect(order.user).toBe(user._id.toString());
			});
		});

		it("orders are returned with correct structure", async () => {
			await createMultipleTestOrders(user._id.toString(), 1);

			const res = await getCurrentUserOrdersRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.length).toBe(1);
			expect(res.body.data.orders).toHaveLength(1);

			const order = res.body.data.orders[0];
			expectValidOrderResponse(order);

			// Check that order items are populated
			expect(order.orderItems).toBeDefined();
			expect(Array.isArray(order.orderItems)).toBe(true);
			expect(order.orderItems.length).toBeGreaterThan(0);
		});

		it("orders are sorted by creation date (newest first)", async () => {
			// Create orders with slight delay to ensure different timestamps
			await createMultipleTestOrders(user._id.toString(), 1);
			await new Promise(resolve => setTimeout(resolve, 10));
			await createMultipleTestOrders(user._id.toString(), 1);
			await new Promise(resolve => setTimeout(resolve, 10));
			await createMultipleTestOrders(user._id.toString(), 1);

			const res = await getCurrentUserOrdersRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.data.orders).toHaveLength(3);

			// Check that orders are sorted by creation date (newest first)
			const orders = res.body.data.orders;
			for (let i = 0; i < orders.length - 1; i++) {
				const currentOrderDate = new Date(orders[i].createdAt);
				const nextOrderDate = new Date(orders[i + 1].createdAt);
				expect(
					currentOrderDate.getTime()
				).toBeGreaterThanOrEqual(nextOrderDate.getTime());
			}
		});
	});
});
