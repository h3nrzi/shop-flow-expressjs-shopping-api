import app from "@/app";
import { IProductQuery } from "@/core/products/product.interface";
import request, { Response } from "supertest";

export const getAllProductsRequest = (
	query?: IProductQuery
): Promise<Response> => {
	const queryString = query
		? Object.entries(query)
				.map(([key, value]) => `${key}=${value}`)
				.join("&")
		: "";

	return request(app).get(`/api/products?${queryString}`);
};

export const getProductRequest = (
	id: string
): Promise<Response> => {
	return request(app).get(`/api/products/${id}`);
};

export const validProduct = {
	name: "Test Product",
	description: "A test product",
	image: "test.jpg",
	brand: "TestBrand",
	category: "TestCategory",
	countInStock: 10,
	isAvailable: true,
	rating: 5,
	numReviews: 10,
	discount: 10,
	price: 1000,
};
