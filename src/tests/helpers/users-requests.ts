import app from "@/app";
import request, { Response } from "supertest";
import { IUpdateCurrentUserInfoDto } from "@/core/users/dtos/update-currentuser-info.dto";
import { IUpdateCurrentUserPasswordDto } from "@/core/users/dtos/update-currentuser-password.dto";

export const getMe = async (
	cookie: string
): Promise<Response> => {
	return await request(app)
		.get("/api/users/get-me")
		.set("Cookie", cookie);
};

export const updateMe = async (
	cookie: string,
	body: IUpdateCurrentUserInfoDto
): Promise<Response> => {
	return await request(app)
		.patch("/api/users/update-me")
		.set("Cookie", cookie)
		.send(body);
};

export const updateMePassword = async (
	cookie: string,
	body: IUpdateCurrentUserPasswordDto
): Promise<Response> => {
	return await request(app)
		.patch("/api/users/update-me-password")
		.set("Cookie", cookie)
		.send(body);
};

export const deleteMe = async (
	cookie: string
): Promise<Response> => {
	return await request(app)
		.delete("/api/users/delete-me")
		.set("Cookie", cookie);
};
