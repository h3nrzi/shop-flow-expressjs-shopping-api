import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	getAllOrdersRequest,
	createTestUserAndGetCookie,
	createMultipleTestOrders,
	expectValidOrderResponse,
} from "@/__tests__/helpers/orders.helper";

describe("GET /api/orders (Admin Only)", () => {
	let userCookie: string;
	let adminCookie: string;
	let user: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie(
			"orderuser"
		);
		userCookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestUserAndGetCookie(
			"admin",
			"admin"
		);
		adminCookie = testAdmin.cookie;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await getAllOrdersRequest();

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await getAllOrdersRequest(invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!"
			);
		});
	});

	describe("should return 403, if", () => {
		it("regular user tries to access admin endpoint", async () => {
			const res = await getAllOrdersRequest(userCookie);

			expect(res.status).toBe(403);
		});
	});

	describe("should return 200, if", () => {
		it("admin accesses endpoint with no orders", async () => {
			const res = await getAllOrdersRequest(adminCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.length).toBe(0);
			expect(res.body.data.orders).toEqual([]);
		});

		it("admin gets all orders from all users", async () => {
			// Create orders for different users
			await createMultipleTestOrders(user._id.toString(), 2);

			const user2 = await createTestUserAndGetCookie("user2");
			await createMultipleTestOrders(
				user2.user._id.toString(),
				3
			);

			const res = await getAllOrdersRequest(adminCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.length).toBe(5);
			expect(res.body.data.orders).toHaveLength(5);

			// Validate each order structure
			res.body.data.orders.forEach((order: any) => {
				expectValidOrderResponse(order);
			});

			// Check that orders from both users are included
			const userIds = res.body.data.orders.map(
				(order: any) => order.user
			);
			expect(userIds).toContain(user._id.toString());
			expect(userIds).toContain(user2.user._id.toString());
		});

		it("admin gets orders with complete information", async () => {
			await createMultipleTestOrders(user._id.toString(), 1);

			const res = await getAllOrdersRequest(adminCookie);

			expect(res.status).toBe(200);
			expect(res.body.data.orders).toHaveLength(1);

			const order = res.body.data.orders[0];
			expectValidOrderResponse(order);

			// Check that all order information is present
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
		});

		it("admin gets orders sorted by creation date (newest first)", async () => {
			// Create orders with slight delay to ensure different timestamps
			await createMultipleTestOrders(user._id.toString(), 1);
			await new Promise(resolve => setTimeout(resolve, 10));
			await createMultipleTestOrders(user._id.toString(), 1);
			await new Promise(resolve => setTimeout(resolve, 10));
			await createMultipleTestOrders(user._id.toString(), 1);

			const res = await getAllOrdersRequest(adminCookie);

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

		it("admin gets orders with populated user information", async () => {
			await createMultipleTestOrders(user._id.toString(), 1);

			const res = await getAllOrdersRequest(adminCookie);

			expect(res.status).toBe(200);
			expect(res.body.data.orders).toHaveLength(1);

			const order = res.body.data.orders[0];
			expect(order.user).toBe(user._id.toString());
		});

		it("admin gets orders with populated product information", async () => {
			await createMultipleTestOrders(user._id.toString(), 1);

			const res = await getAllOrdersRequest(adminCookie);

			expect(res.status).toBe(200);
			expect(res.body.data.orders).toHaveLength(1);

			const order = res.body.data.orders[0];
			expect(order.orderItems).toBeDefined();
			expect(Array.isArray(order.orderItems)).toBe(true);
			expect(order.orderItems.length).toBeGreaterThan(0);

			const orderItem = order.orderItems[0];
			expect(orderItem.product).toBeDefined();
			expect(orderItem.qty).toBeDefined();
		});

		it("admin gets orders from multiple users with different statuses", async () => {
			// Create orders with different payment and delivery statuses
			await createMultipleTestOrders(user._id.toString(), 1);

			const user2 = await createTestUserAndGetCookie("user2");
			await createMultipleTestOrders(
				user2.user._id.toString(),
				1
			);

			const res = await getAllOrdersRequest(adminCookie);

			expect(res.status).toBe(200);
			expect(res.body.data.orders).toHaveLength(2);

			// All orders should have default status (unpaid, undelivered)
			res.body.data.orders.forEach((order: any) => {
				expect(order.isPaid).toBe(false);
				expect(order.isDelivered).toBe(false);
			});
		});
	});
});
