import { getAllProductsRequest } from "@/__tests__/helpers/products.helper";
import { productRepository } from "@/core";

describe("GET /api/products", () => {
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
				brand: "Brand ${i}",
				category: "Category ${i}",
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
});
