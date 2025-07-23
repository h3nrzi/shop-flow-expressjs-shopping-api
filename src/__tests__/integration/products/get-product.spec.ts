import { getProductRequest } from "@/__tests__/helpers/products.helper";
import { productRepository } from "@/core";
import mongoose from "mongoose";

describe("GET /api/products/:id", () => {
	describe("400", () => {
		it("if id is not a valid object id", async () => {
			const res = await getProductRequest("invalid-id");
			expect(res.status).toBe(400);
		});
	});

	describe("404", () => {
		it("if product not found", async () => {
			const invalidId = new mongoose.Types.ObjectId().toString();
			const res = await getProductRequest(invalidId);
			expect(res.status).toBe(404);
		});
	});

	describe("200", () => {
		it("if find the product", async () => {
			const product = await productRepository.createOne({
				name: "Test Product",
				description: "Test Description",
				price: 100000,
				image: "https://via.placeholder.com/150",
				category: "Test Category",
				brand: "Test Brand",
				countInStock: 10,
				isAvailable: true,
				rating: 5,
				numReviews: 10,
				discount: 10,
			});
			const res = await getProductRequest(product.id);

			expect(res.status).toBe(200);
			expect(res.body.data.product.id).toBe(product.id);
		});
	});
});
