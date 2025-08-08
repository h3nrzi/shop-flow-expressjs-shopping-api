import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	getTopSellingProductsRequest,
	createTestUserAndGetCookie,
	createTestOrder,
	createTestProduct,
} from "@/__tests__/helpers/orders.helper";

describe("GET /api/orders/top-selling-products", () => {
	let cookie: string;
	let user: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("orderuser");
		cookie = testUser.cookie;
		user = testUser.user;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await getTopSellingProductsRequest();

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await getTopSellingProductsRequest(invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!",
			);
		});
	});

	describe("should return 200, if", () => {
		it("no orders exist", async () => {
			const res = await getTopSellingProductsRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.result).toBe(0);
			expect(res.body.data.orders).toEqual([]);
		});

		it("orders exist and returns top selling products", async () => {
			// Create test products
			const product1 = await createTestProduct();
			const product2 = await createTestProduct();
			const product3 = await createTestProduct();

			// Create orders with different quantities to test sorting
			await createTestOrder(user._id.toString(), product1._id.toString(), {
				orderItems: [{ productId: product1._id.toString(), qty: 5 }],
			});

			await createTestOrder(user._id.toString(), product2._id.toString(), {
				orderItems: [{ productId: product2._id.toString(), qty: 3 }],
			});

			await createTestOrder(user._id.toString(), product3._id.toString(), {
				orderItems: [{ productId: product3._id.toString(), qty: 8 }],
			});

			// Create another order for product1 to increase its total
			await createTestOrder(user._id.toString(), product1._id.toString(), {
				orderItems: [{ productId: product1._id.toString(), qty: 2 }],
			});

			const res = await getTopSellingProductsRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.result).toBeGreaterThan(0);
			expect(res.body.data.orders).toBeDefined();
			expect(Array.isArray(res.body.data.orders)).toBe(true);
		});

		it("returns products sorted by total quantity sold (descending)", async () => {
			// Create test products
			const product1 = await createTestProduct();
			const product2 = await createTestProduct();
			const product3 = await createTestProduct();

			// Create orders with specific quantities
			// Product1: total 7 (5 + 2)
			await createTestOrder(user._id.toString(), product1._id.toString(), {
				orderItems: [{ productId: product1._id.toString(), qty: 5 }],
			});
			await createTestOrder(user._id.toString(), product1._id.toString(), {
				orderItems: [{ productId: product1._id.toString(), qty: 2 }],
			});

			// Product2: total 3
			await createTestOrder(user._id.toString(), product2._id.toString(), {
				orderItems: [{ productId: product2._id.toString(), qty: 3 }],
			});

			// Product3: total 10
			await createTestOrder(user._id.toString(), product3._id.toString(), {
				orderItems: [{ productId: product3._id.toString(), qty: 10 }],
			});

			const res = await getTopSellingProductsRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.data.orders).toHaveLength(3);

			// Check that products are sorted by totalSold in descending order
			const orders = res.body.data.orders;
			expect(orders[0].totalSold).toBe(10); // Product3
			expect(orders[1].totalSold).toBe(7); // Product1
			expect(orders[2].totalSold).toBe(3); // Product2
		});

		it("includes product information in the response", async () => {
			const product = await createTestProduct();
			await createTestOrder(user._id.toString(), product._id.toString(), {
				orderItems: [{ productId: product._id.toString(), qty: 2 }],
			});

			const res = await getTopSellingProductsRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.data.orders).toHaveLength(1);

			const topProduct = res.body.data.orders[0];
			expect(topProduct.totalSold).toBe(2);
			expect(topProduct.product).toBeDefined();
			expect(Array.isArray(topProduct.product)).toBe(true);

			if (topProduct.product.length > 0) {
				const productInfo = topProduct.product[0];
				expect(productInfo).toHaveProperty("name");
				expect(productInfo).toHaveProperty("price");
			}
		});

		it("limits results to top 10 products", async () => {
			// Create 15 products with orders
			const products = [];
			for (let i = 0; i < 15; i++) {
				const product = await createTestProduct();
				products.push(product);
				await createTestOrder(user._id.toString(), product._id.toString(), {
					orderItems: [{ productId: product._id.toString(), qty: i + 1 }],
				});
			}

			const res = await getTopSellingProductsRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.data.orders.length).toBeLessThanOrEqual(10);
		});

		it("handles orders with multiple items correctly", async () => {
			const product1 = await createTestProduct();
			const product2 = await createTestProduct();

			// Create an order with multiple items
			await createTestOrder(user._id.toString(), product1._id.toString(), {
				orderItems: [
					{ productId: product1._id.toString(), qty: 3 },
					{ productId: product2._id.toString(), qty: 2 },
				],
			});

			// Create another order for product1
			await createTestOrder(user._id.toString(), product1._id.toString(), {
				orderItems: [{ productId: product1._id.toString(), qty: 1 }],
			});

			const res = await getTopSellingProductsRequest(cookie);

			expect(res.status).toBe(200);
			expect(res.body.data.orders).toHaveLength(2);

			// Find product1 and product2 in results
			const product1Result = res.body.data.orders.find(
				(item: any) =>
					item.product[0] &&
					item.product[0]._id.toString() === product1._id.toString(),
			);
			const product2Result = res.body.data.orders.find(
				(item: any) =>
					item.product[0] &&
					item.product[0]._id.toString() === product2._id.toString(),
			);

			expect(product1Result.totalSold).toBe(4); // 3 + 1
			expect(product2Result.totalSold).toBe(2);
		});
	});
});
