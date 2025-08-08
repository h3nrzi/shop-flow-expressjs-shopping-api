import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	getOrderByIdRequest,
	createTestUserAndGetCookie,
	createTestOrder,
	getInvalidId,
	getInvalidObjectId,
	expectValidOrderResponse,
} from "@/__tests__/helpers/orders.helper";

describe("GET /api/orders/:id", () => {
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
			const res = await getOrderByIdRequest(order._id.toString());

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await getOrderByIdRequest(
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
			const res = await getOrderByIdRequest(getInvalidId(), cookie);

			expect(res.status).toBe(400);
		});
	});

	describe("should return 403, if", () => {
		it("user tries to access another user's order", async () => {
			// Create another user and their order
			const otherUser = await createTestUserAndGetCookie("otheruser");
			const otherOrder = await createTestOrder(otherUser.user._id.toString());

			const res = await getOrderByIdRequest(otherOrder._id.toString(), cookie);

			expect(res.status).toBe(403);
		});
	});

	describe("should return 404, if", () => {
		it("order does not exist", async () => {
			const nonExistentOrderId = getInvalidObjectId();
			const res = await getOrderByIdRequest(nonExistentOrderId, cookie);

			expect(res.status).toBe(404);
		});
	});

	describe("should return 200, if", () => {
		it("user accesses their own order", async () => {
			const res = await getOrderByIdRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.order).toBeDefined();
			expectValidOrderResponse(res.body.data.order);
			expect(res.body.data.order.id).toBe(order._id.toString());
			expect(res.body.data.order.user).toBe(user._id.toString());
		});

		it("admin can access any user's order", async () => {
			const res = await getOrderByIdRequest(order._id.toString(), adminCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.order).toBeDefined();
			expectValidOrderResponse(res.body.data.order);
			expect(res.body.data.order.id).toBe(order._id.toString());
		});

		it("order contains populated product information", async () => {
			const res = await getOrderByIdRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			expect(res.body.data.order.orderItems).toBeDefined();
			expect(Array.isArray(res.body.data.order.orderItems)).toBe(true);
			expect(res.body.data.order.orderItems.length).toBeGreaterThan(0);

			// Check that product information is included
			const orderItem = res.body.data.order.orderItems[0];
			expect(orderItem.product).toBeDefined();
			expect(orderItem.qty).toBeDefined();
		});

		it("order contains user information", async () => {
			const res = await getOrderByIdRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			expect(res.body.data.order.user).toBeDefined();
		});

		it("order contains complete shipping address", async () => {
			const res = await getOrderByIdRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			const shippingAddress = res.body.data.order.shippingAddress;
			expect(shippingAddress).toBeDefined();
			expect(shippingAddress.province).toBeDefined();
			expect(shippingAddress.city).toBeDefined();
			expect(shippingAddress.street).toBeDefined();
		});

		it("order contains payment and pricing information", async () => {
			const res = await getOrderByIdRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			const orderData = res.body.data.order;
			expect(orderData.paymentMethod).toBeDefined();
			expect(orderData.itemsPrice).toBeDefined();
			expect(orderData.shippingPrice).toBeDefined();
			expect(orderData.taxPrice).toBeDefined();
			expect(orderData.totalPrice).toBeDefined();
			expect(orderData.isPaid).toBeDefined();
			expect(orderData.isDelivered).toBeDefined();
		});

		it("order contains timestamps", async () => {
			const res = await getOrderByIdRequest(order._id.toString(), cookie);

			expect(res.status).toBe(200);
			const orderData = res.body.data.order;
			expect(orderData.createdAt).toBeDefined();
			expect(orderData.updatedAt).toBeDefined();
		});
	});
});
