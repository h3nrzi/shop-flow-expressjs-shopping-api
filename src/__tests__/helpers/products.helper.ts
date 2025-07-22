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

	console.log(`/api/products?${queryString}`);
	return request(app).get(`/api/products?${queryString}`);
};

export const getProductRequest = (
	id: string
): Promise<Response> => {
	return request(app).get(`/api/products/${id}`);
};
