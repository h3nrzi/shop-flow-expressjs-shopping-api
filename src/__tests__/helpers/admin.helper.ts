import app from "@/app";
import { ICreateUserDto } from "@/core/users/dtos/create-user.dto";
import { IUpdateUserDto } from "@/core/users/dtos/update-user.dto";
import request, { Response } from "supertest";
import { CreateProductDto } from "@/core/products/dtos/create-product.dto";

// ===============================================
// ============ Users Related Requests ============
// ===============================================

export const allUsersRequest = async (cookie: string): Promise<Response> => {
	return await request(app).get("/api/users").set("Cookie", cookie);
};

export const getUserRequest = async (
	cookie: string,
	userId: string,
): Promise<Response> => {
	return await request(app).get(`/api/users/${userId}`).set("Cookie", cookie);
};

export const createUserRequest = async (
	cookie: string,
	body: ICreateUserDto,
): Promise<Response> => {
	return await request(app).post("/api/users").set("Cookie", cookie).send(body);
};

export const updateUserRequest = async (
	cookie: string,
	userId: string,
	body: IUpdateUserDto,
): Promise<Response> => {
	return await request(app)
		.patch(`/api/users/${userId}`)
		.set("Cookie", cookie)
		.send(body);
};

export const deleteUserRequest = async (
	cookie: string,
	userId: string,
): Promise<Response> => {
	return await request(app)
		.delete(`/api/users/${userId}`)
		.set("Cookie", cookie);
};

export const getUsersCountByDayRequest = async (
	cookie: string,
	period?: string,
): Promise<Response> => {
	let url = "/api/users/get-users-count";
	if (period) url += `?period=${period}`;
	return await request(app).get(url).set("Cookie", cookie);
};

// ===============================================
// ============ Products Related Requests ========
// ===============================================

export const createProductRequest = async (
	cookie: string,
	body: CreateProductDto,
): Promise<Response> => {
	return await request(app)
		.post("/api/products")
		.set("Cookie", cookie)
		.send(body);
};

// ===============================================
// ============ Orders Related Requests ==========
// ===============================================
