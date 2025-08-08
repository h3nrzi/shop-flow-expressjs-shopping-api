import app from "@/app";
import request, { Response } from "supertest";
import { signupRequest, getUniqueUser } from "./auth.helper";
import { orderRepository, productRepository, userRepository } from "@/core";
import { validProduct } from "./products.helper";
import { CreateOrderDto } from "@/core/orders/dtos/create-order.dto";
import { UpdateOrderDto } from "@/core/orders/dtos/update-order.dto";
import mongoose from "mongoose";

// ===============================================
// ============ Helper Requests =================
// ===============================================

export const createOrderRequest = (
	body: CreateOrderDto,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).post("/api/orders").send(body);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const getCurrentUserOrdersRequest = (
	cookie?: string,
): Promise<Response> => {
	const req = request(app).get("/api/orders/get-myorders");

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const getOrderByIdRequest = (
	orderId: string,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).get(`/api/orders/${orderId}`);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const updateOrderToPaidRequest = (
	orderId: string,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).patch(`/api/orders/${orderId}/pay`);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const getTopSellingProductsRequest = (
	cookie?: string,
): Promise<Response> => {
	const req = request(app).get("/api/orders/top-selling-products");

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

// Admin only requests
export const getAllOrdersRequest = (cookie?: string): Promise<Response> => {
	const req = request(app).get("/api/orders");

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const updateOrderRequest = (
	orderId: string,
	body: UpdateOrderDto,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).patch(`/api/orders/${orderId}`).send(body);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const deleteOrderRequest = (
	orderId: string,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).delete(`/api/orders/${orderId}`);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const updateOrderToDeliverRequest = (
	orderId: string,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).patch(`/api/orders/${orderId}/deliver`);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

// ===============================================
// ============ Test Data & Utilities ===========
// ===============================================

export const validOrderData: CreateOrderDto = {
	orderItems: [
		{
			productId: new mongoose.Types.ObjectId().toString(),
			qty: 2,
		},
	],
	shippingAddress: {
		province: "Tehran",
		city: "Tehran",
		street: "Valiasr Street, No. 123",
	},
	paymentMethod: "Credit Card",
	itemsPrice: 20000,
	shippingPrice: 5000,
	taxPrice: 2000,
	totalPrice: 27000,
};

export const getValidOrderData = (
	productId?: string,
	qty: number = 2,
): CreateOrderDto => ({
	orderItems: [
		{
			productId: productId || new mongoose.Types.ObjectId().toString(),
			qty,
		},
	],
	shippingAddress: {
		province: "Tehran",
		city: "Tehran",
		street: "Valiasr Street, No. 123",
	},
	paymentMethod: "Credit Card",
	itemsPrice: 20000 * qty,
	shippingPrice: 5000,
	taxPrice: 2000 * qty,
	totalPrice: 27000 * qty,
});

export const getInvalidOrderData = () => [
	{
		testCase: "orderItems is missing",
		data: {
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			shippingPrice: 5000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "شناسه محصول معتبر نیست",
	},
	{
		testCase: "orderItems[0].productId is invalid",
		data: {
			orderItems: [
				{
					productId: "invalid-id",
					qty: 2,
				},
			],
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			shippingPrice: 5000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "شناسه محصول معتبر نیست",
	},
	{
		testCase: "orderItems[0].qty is missing",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
				},
			],
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			shippingPrice: 5000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "تعداد محصولات الزامی است",
	},
	{
		testCase: "orderItems[0].qty is less than 1",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
					qty: 0,
				},
			],
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			shippingPrice: 5000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "تعداد محصولات الزامی است",
	},
	{
		testCase: "shippingAddress.province is missing",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
					qty: 2,
				},
			],
			shippingAddress: {
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			shippingPrice: 5000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "استان الزامی است",
	},
	{
		testCase: "shippingAddress.city is missing",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
					qty: 2,
				},
			],
			shippingAddress: {
				province: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			shippingPrice: 5000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "شهر الزامی است",
	},
	{
		testCase: "shippingAddress.street is missing",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
					qty: 2,
				},
			],
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			shippingPrice: 5000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "خیابان الزامی است",
	},
	{
		testCase: "paymentMethod is missing",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
					qty: 2,
				},
			],
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			itemsPrice: 20000,
			shippingPrice: 5000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "روش پرداخت الزامی است",
	},
	{
		testCase: "itemsPrice is missing",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
					qty: 2,
				},
			],
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			shippingPrice: 5000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "قیمت محصولات الزامی است",
	},
	{
		testCase: "shippingPrice is missing",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
					qty: 2,
				},
			],
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			taxPrice: 2000,
			totalPrice: 27000,
		},
		expectedError: "قیمت حمل و نقل الزامی است",
	},
	{
		testCase: "taxPrice is missing",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
					qty: 2,
				},
			],
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			shippingPrice: 5000,
			totalPrice: 27000,
		},
		expectedError: "مالیات الزامی است",
	},
	{
		testCase: "totalPrice is missing",
		data: {
			orderItems: [
				{
					productId: new mongoose.Types.ObjectId().toString(),
					qty: 2,
				},
			],
			shippingAddress: {
				province: "Tehran",
				city: "Tehran",
				street: "Valiasr Street, No. 123",
			},
			paymentMethod: "Credit Card",
			itemsPrice: 20000,
			shippingPrice: 5000,
			taxPrice: 2000,
		},
		expectedError: "قیمت کل الزامی است",
	},
];

// ===============================================
// ============ Setup Helper Functions ==========
// ===============================================

export const createTestUserAndGetCookie = async (
	suffix: string = "orderuser",
	role: string = "user",
) => {
	const user = getUniqueUser(suffix);
	const signupResponse = await signupRequest(user);
	const cookie = signupResponse.headers["set-cookie"][0];
	const userDoc = await userRepository.findByEmail(user.email);
	if (!userDoc || !userDoc._id) {
		throw new Error("Failed to create test user");
	}

	// Update user role if needed
	if (role === "admin") {
		await userRepository.update(userDoc._id.toString(), {
			role: "admin",
		} as any);
	}

	// Convert to plain object to ensure _id is accessible
	const plainUser = userDoc.toObject ? userDoc.toObject() : userDoc;
	return { user: plainUser, cookie, userData: user };
};

export const createTestProduct = async () => {
	const product = await productRepository.createOne(validProduct);
	if (!product) {
		throw new Error("Failed to create test product - product is null");
	}
	if (!product._id) {
		throw new Error("Failed to create test product - _id is missing");
	}
	// Ensure _id is accessible by converting to plain object or accessing directly
	const result = product.toObject ? product.toObject() : product;
	if (!result._id) {
		throw new Error(
			"Failed to create test product - _id lost after conversion",
		);
	}
	return result;
};

export const createTestOrder = async (
	userId: string,
	productId?: string,
	orderData?: Partial<CreateOrderDto>,
) => {
	const defaultOrderData = getValidOrderData(productId);
	const finalOrderData = { ...defaultOrderData, ...orderData };

	const order = await orderRepository.create(finalOrderData, userId);

	if (!order || !order._id) {
		throw new Error("Failed to create test order");
	}
	// Convert to plain object to ensure _id is accessible
	return order.toObject ? order.toObject() : order;
};

export const createMultipleTestOrders = async (
	userId: string,
	count: number = 3,
) => {
	const orders = [];
	for (let i = 0; i < count; i++) {
		const product = await createTestProduct();
		const order = await createTestOrder(userId, product._id.toString(), {
			itemsPrice: (i + 1) * 10000,
			totalPrice: (i + 1) * 15000,
		});
		orders.push(order);
	}
	return orders;
};

export const getInvalidObjectId = () =>
	new mongoose.Types.ObjectId().toString();

export const getInvalidId = () => "invalid-id";

// ===============================================
// ============ Assertion Helpers ===============
// ===============================================

export const expectValidOrderResponse = (order: any, expectedData?: any) => {
	expect(order).toHaveProperty("id");
	expect(order).toHaveProperty("user");
	expect(order).toHaveProperty("orderItems");
	expect(order).toHaveProperty("shippingAddress");
	expect(order).toHaveProperty("paymentMethod");
	expect(order).toHaveProperty("itemsPrice");
	expect(order).toHaveProperty("shippingPrice");
	expect(order).toHaveProperty("taxPrice");
	expect(order).toHaveProperty("totalPrice");
	expect(order).toHaveProperty("isPaid");
	expect(order).toHaveProperty("isDelivered");
	expect(order).toHaveProperty("createdAt");
	expect(order).toHaveProperty("updatedAt");

	// Validate orderItems structure
	expect(Array.isArray(order.orderItems)).toBe(true);
	if (order.orderItems.length > 0) {
		expect(order.orderItems[0]).toHaveProperty("product");
		expect(order.orderItems[0]).toHaveProperty("qty");
	}

	// Validate shippingAddress structure
	expect(order.shippingAddress).toHaveProperty("province");
	expect(order.shippingAddress).toHaveProperty("city");
	expect(order.shippingAddress).toHaveProperty("street");

	if (expectedData) {
		expect(order.paymentMethod).toBe(expectedData.paymentMethod);
		expect(order.itemsPrice).toBe(expectedData.itemsPrice);
		expect(order.totalPrice).toBe(expectedData.totalPrice);
	}
};

export const expectOrderStatusUpdate = (
	order: any,
	isPaid?: boolean,
	isDelivered?: boolean,
) => {
	if (isPaid !== undefined) {
		expect(order.isPaid).toBe(isPaid);
		if (isPaid) {
			expect(order.paidAt).toBeDefined();
		}
	}

	if (isDelivered !== undefined) {
		expect(order.isDelivered).toBe(isDelivered);
		if (isDelivered) {
			expect(order.deliveredAt).toBeDefined();
		}
	}
};
