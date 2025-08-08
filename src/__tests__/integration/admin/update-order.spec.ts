import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	updateOrderRequest,
	createTestUserAndGetCookie,
	createTestOrder,
	createTestProduct,
	getInvalidId,
	getInvalidObjectId,
	expectValidOrderResponse,
} from "@/__tests__/helpers/orders.helper";

describe("PATCH /api/orders/:id (Admin Only)", () => {
	let userCookie: string;
	let adminCookie: string;
	let user: any;
	let order: any;
	let product: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("orderuser");
		userCookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestUserAndGetCookie("admin", "admin");
		adminCookie = testAdmin.cookie;

		product = await createTestProduct();
		order = await createTestOrder(user._id.toString(), product._id.toString());
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const updateData = { paymentMethod: "PayPal" };
			const res = await updateOrderRequest(order._id.toString(), updateData);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const updateData = { paymentMethod: "PayPal" };
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
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
			const updateData = { paymentMethod: "PayPal" };
			const res = await updateOrderRequest(
				getInvalidId(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(400);
		});

		it("orderItems[0].productId is invalid", async () => {
			const updateData = {
				orderItems: [
					{
						productId: "invalid-id",
						qty: 2,
					},
				],
			};
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("فرمت شناسه محصول معتبر نیست");
		});

		it("orderItems[0].qty is less than 1", async () => {
			const updateData = {
				orderItems: [
					{
						productId: product._id.toString(),
						qty: 0,
					},
				],
			};
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("فرمت تعداد محصولات معتبر نیست");
		});

		it("itemsPrice is not numeric", async () => {
			const updateData = { itemsPrice: "not-a-number" } as any;
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("فرمت قیمت محصولات معتبر نیست");
		});

		it("shippingPrice is not numeric", async () => {
			const updateData = {
				shippingPrice: "not-a-number",
			} as any;
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("فرمت قیمت حمل و نقل معتبر نیست");
		});

		it("taxPrice is not numeric", async () => {
			const updateData = { taxPrice: "not-a-number" } as any;
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("فرمت مالیات معتبر نیست");
		});

		it("totalPrice is not numeric", async () => {
			const updateData = { totalPrice: "not-a-number" } as any;
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("فرمت قیمت کل معتبر نیست");
		});
	});

	describe("should return 403, if", () => {
		it("regular user tries to access admin endpoint", async () => {
			const updateData = { paymentMethod: "PayPal" };
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				userCookie,
			);

			expect(res.status).toBe(403);
		});
	});

	describe("should return 404, if", () => {
		it("order does not exist", async () => {
			const nonExistentOrderId = getInvalidObjectId();
			const updateData = { paymentMethod: "PayPal" };
			const res = await updateOrderRequest(
				nonExistentOrderId,
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(404);
		});
	});

	describe("should return 200, if", () => {
		it("admin successfully updates order payment method", async () => {
			const updateData = { paymentMethod: "PayPal" };
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.order).toBeDefined();
			expectValidOrderResponse(res.body.data.order);
			expect(res.body.data.order.paymentMethod).toBe("PayPal");
		});

		it("admin successfully updates order items", async () => {
			const newProduct = await createTestProduct();
			const updateData = {
				orderItems: [
					{
						productId: newProduct._id.toString(),
						qty: 5,
					},
				],
			};
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.data.order.orderItems).toHaveLength(1);
			expect(res.body.data.order.orderItems[0].qty).toBe(5);
		});

		it("admin successfully updates shipping address", async () => {
			const updateData = {
				shippingAddress: {
					province: "Isfahan",
					city: "Isfahan",
					street: "Chahar Bagh Street, No. 456",
				},
			};
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.data.order.shippingAddress.province).toBe("Isfahan");
			expect(res.body.data.order.shippingAddress.city).toBe("Isfahan");
			expect(res.body.data.order.shippingAddress.street).toBe(
				"Chahar Bagh Street, No. 456",
			);
		});

		it("admin successfully updates pricing information", async () => {
			const updateData = {
				itemsPrice: 50000,
				shippingPrice: 8000,
				taxPrice: 5000,
				totalPrice: 63000,
			};
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.data.order.itemsPrice).toBe(50000);
			expect(res.body.data.order.shippingPrice).toBe(8000);
			expect(res.body.data.order.taxPrice).toBe(5000);
			expect(res.body.data.order.totalPrice).toBe(63000);
		});

		it("admin successfully updates multiple fields at once", async () => {
			const updateData = {
				paymentMethod: "Bank Transfer",
				itemsPrice: 35000,
				totalPrice: 42000,
				shippingAddress: {
					province: "Shiraz",
					city: "Shiraz",
					street: "Zand Street, No. 789",
				},
			};
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.data.order.paymentMethod).toBe("Bank Transfer");
			expect(res.body.data.order.itemsPrice).toBe(35000);
			expect(res.body.data.order.totalPrice).toBe(42000);
			expect(res.body.data.order.shippingAddress.province).toBe("Shiraz");
		});

		it("admin update preserves unchanged fields", async () => {
			const originalPaymentMethod = order.paymentMethod;
			const originalItemsPrice = order.itemsPrice;

			const updateData = { shippingPrice: 7000 };
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.data.order.paymentMethod).toBe(originalPaymentMethod);
			expect(res.body.data.order.itemsPrice).toBe(originalItemsPrice);
			expect(res.body.data.order.shippingPrice).toBe(7000);
		});

		it("admin update updates the updatedAt timestamp", async () => {
			const originalUpdatedAt = order.updatedAt;

			// Wait a moment to ensure timestamp difference
			await new Promise((resolve) => setTimeout(resolve, 10));

			const updateData = { paymentMethod: "Cash" };
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(new Date(res.body.data.order.updatedAt).getTime()).toBeGreaterThan(
				new Date(originalUpdatedAt).getTime(),
			);
		});

		it("admin can update order with empty update data", async () => {
			const updateData = {};
			const res = await updateOrderRequest(
				order._id.toString(),
				updateData,
				adminCookie,
			);

			expect(res.status).toBe(200);
			expect(res.body.data.order).toBeDefined();
			expectValidOrderResponse(res.body.data.order);
		});
	});
});
