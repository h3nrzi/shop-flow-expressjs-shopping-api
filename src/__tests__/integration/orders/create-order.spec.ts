import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createOrderRequest,
	createTestProduct,
	createTestUserAndGetCookie,
	expectValidOrderResponse,
	getInvalidObjectId,
	getInvalidOrderData,
	getValidOrderData,
} from "@/__tests__/helpers/orders.helper";

describe("POST /api/orders", () => {
	let product: any;
	let cookie: string;
	let user: any;

	beforeEach(async () => {
		product = await createTestProduct();
		const testUser = await createTestUserAndGetCookie("orderuser");
		cookie = testUser.cookie;
		user = testUser.user;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const orderData = getValidOrderData(product._id.toString());
			const res = await createOrderRequest(orderData);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const orderData = getValidOrderData(product._id.toString());
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await createOrderRequest(orderData, invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!",
			);
		});
	});

	describe("should return 400, if", () => {
		const invalidDataCases = getInvalidOrderData();
		invalidDataCases.forEach(({ testCase, data, expectedError }) => {
			it(testCase, async () => {
				const res = await createOrderRequest(data as any, cookie);

				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBe(expectedError);
			});
		});
	});

	describe("should return 404, if", () => {
		it("product does not exist", async () => {
			const nonExistentProductId = getInvalidObjectId();
			const orderData = getValidOrderData(nonExistentProductId);
			const res = await createOrderRequest(orderData, cookie);

			expect(res.status).toBe(404);
		});
	});

	describe("should return 201, if", () => {
		it("order is created successfully with valid data", async () => {
			const orderData = getValidOrderData(product._id.toString(), 3);
			const res = await createOrderRequest(orderData, cookie);

			expect(res.status).toBe(201);
			expect(res.body.status).toBe("success");
			expect(res.body.data.order).toBeDefined();
			expectValidOrderResponse(res.body.data.order, orderData);
		});

		it("order is created with multiple products", async () => {
			const product2 = await createTestProduct();
			const orderData = {
				orderItems: [
					{
						productId: product._id.toString(),
						qty: 2,
					},
					{
						productId: product2._id.toString(),
						qty: 1,
					},
				],
				shippingAddress: {
					province: "Tehran",
					city: "Tehran",
					street: "Valiasr Street, No. 123",
				},
				paymentMethod: "Credit Card",
				itemsPrice: 30000,
				shippingPrice: 5000,
				taxPrice: 3000,
				totalPrice: 38000,
			};

			const res = await createOrderRequest(orderData, cookie);

			expect(res.status).toBe(201);
			expect(res.body.status).toBe("success");
			expect(res.body.data.order).toBeDefined();
			expect(res.body.data.order.orderItems).toHaveLength(2);
			expectValidOrderResponse(res.body.data.order, orderData);
		});

		it("order has correct default status values", async () => {
			const orderData = getValidOrderData(product._id.toString());
			const res = await createOrderRequest(orderData, cookie);

			expect(res.status).toBe(201);
			expect(res.body.data.order.isPaid).toBe(false);
			expect(res.body.data.order.isDelivered).toBe(false);
			expect(res.body.data.order.paidAt).toBeUndefined();
			expect(res.body.data.order.deliveredAt).toBeUndefined();
		});

		it("order is associated with the correct user", async () => {
			const orderData = getValidOrderData(product._id.toString());
			const res = await createOrderRequest(orderData, cookie);

			expect(res.status).toBe(201);
			expect(res.body.data.order.user).toBe(user._id.toString());
		});
	});
});
