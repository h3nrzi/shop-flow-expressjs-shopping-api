import { getAllProductsRequest } from "@/__tests__/helpers/products.helper";
import { productRepository } from "@/core";

// const validationCases = [
// 	{
// 		testCaseName:
// 			"should return 400 if invalid pagination values are provided",
// 		query: {
// 			page: -1 as unknown as number,
// 			limit: -5 as unknown as number,
// 		},
// 		expectedStatus: 400,
// 	},
// 	{
// 		testCaseName: "should return 400 if sort order is invalid",
// 		query: {
// 			sort: "invalid" as unknown as "asc" | "desc",
// 		},
// 		expectedStatus: 400,
// 	},
// ];

describe("GET /api/products", () => {
	// describe("Validation", () => {
	// 	validationCases.forEach(
	// 		({ testCaseName, query, expectedStatus }) => {
	// 			it(testCaseName, async () => {
	// 				const res = await getAllProductsRequest(query);
	// 				expect(res.status).toBe(expectedStatus);
	// 			});
	// 		}
	// 	);
	// });

	describe("Success Cases", () => {
		it("should return 200 with no query", async () => {
			const res = await getAllProductsRequest({});
			expect(res.status).toBe(200);
		});

		it("should return 200 with valid query", async () => {
			const res = await getAllProductsRequest({
				discount: 10,
				countInStock: 10,
			});
			expect(res.status).toBe(200);
		});

		it("pagination should work", async () => {
			// create 10 products
			for (let i = 0; i < 10; i++) {
				await productRepository.createOne({
					name: `Product ${i}`,
					price: i * 1000,
					countInStock: 10,
					discount: 10,
					isAvailable: true,
					brand: `Brand ${i}`,
					category: `Category ${i}`,
					rating: i,
					numReviews: i,
					description: `Description ${i}`,
					image: `Image ${i}`,
				});
			}

			// get products with page 2 and limit 5
			const res = await getAllProductsRequest({
				page: 2,
				limit: 5,
			});

			// Due to the pagination, we should have 5 products
			expect(res.status).toBe(200);
			expect(res.body.pagination.page).toBe(2);
			expect(res.body.pagination.limit).toBe(5);
		});

		it("should filter products by brand", async () => {
			// Create test products with specific brands
			await productRepository.createOne({
				name: "Samsung Phone",
				price: 50000,
				countInStock: 10,
				discount: 0,
				isAvailable: true,
				brand: "Samsung",
				category: "Electronics",
				rating: 4.5,
				numReviews: 10,
				description: "Samsung smartphone",
				image: "samsung.jpg",
			});

			const res = await getAllProductsRequest({
				brand: "Samsung",
			});

			expect(res.status).toBe(200);
			expect(res.body.data).toBeDefined();
		});

		it("should filter products by category", async () => {
			await productRepository.createOne({
				name: "Gaming Laptop",
				price: 100000,
				countInStock: 5,
				discount: 15,
				isAvailable: true,
				brand: "ASUS",
				category: "Computers",
				rating: 4.8,
				numReviews: 25,
				description: "High-performance gaming laptop",
				image: "laptop.jpg",
			});

			const res = await getAllProductsRequest({
				category: "Computers",
			});

			expect(res.status).toBe(200);
			expect(res.body.data).toBeDefined();
		});

		it("should filter products by availability", async () => {
			const res = await getAllProductsRequest({
				isAvailable: true,
			});

			expect(res.status).toBe(200);
			expect(res.body.data).toBeDefined();
		});

		it("should work with search query", async () => {
			await productRepository.createOne({
				name: "iPhone 14 Pro",
				price: 120000,
				countInStock: 8,
				discount: 5,
				isAvailable: true,
				brand: "Apple",
				category: "Smartphones",
				rating: 4.9,
				numReviews: 50,
				description: "Latest iPhone with advanced camera",
				image: "iphone.jpg",
			});

			const res = await getAllProductsRequest({
				search: "iPhone",
			});

			expect(res.status).toBe(200);
			expect(res.body.data).toBeDefined();
		});

		it("should handle multiple filters", async () => {
			// create 20 products
			for (let i = 0; i < 20; i++) {
				await productRepository.createOne({
					name: `Product ${i}`,
					price: i * 1000,
					countInStock: 10,
					discount: 10,
					isAvailable: true,
					brand: `Brand ${i % 10}`,
					category: `Category ${i % 10}`,
					rating: i,
					numReviews: i,
					description: `Description ${i}`,
					image: `Image ${i}`,
				});
			}

			const res = await getAllProductsRequest({
				brand: "Brand 0",
				category: "Category 0",
				isAvailable: true,
				page: 1,
				limit: 10,
			});

			expect(res.status).toBe(200);
			expect(res.body.data).toBeDefined();
		});

		it("should work with sorting", async () => {
			const resAsc = await getAllProductsRequest({
				sort: "asc",
			});
			expect(resAsc.status).toBe(200);

			const resDesc = await getAllProductsRequest({
				sort: "desc",
			});
			expect(resDesc.status).toBe(200);
		});

		it("should handle empty results gracefully", async () => {
			const res = await getAllProductsRequest({
				brand: "NonExistentBrand",
			});

			expect(res.status).toBe(200);
			expect(res.body.data).toBeDefined();
		});

		it("should return proper data structure", async () => {
			const res = await getAllProductsRequest({});

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("data");
			expect(res.body).toHaveProperty("pagination");
			if (res.body.pagination) {
				expect(res.body.pagination).toHaveProperty("page");
				expect(res.body.pagination).toHaveProperty("limit");
				expect(res.body.pagination).toHaveProperty("total");
			}
		});
	});
});
