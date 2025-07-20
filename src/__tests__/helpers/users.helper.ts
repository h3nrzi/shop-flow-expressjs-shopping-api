import request, { Response } from "supertest";
import app from "@/app";
import { IUpdateCurrentUserInfoDto } from "@/core/users/dtos/update-currentuser-info.dto";
import { IUpdateCurrentUserPasswordDto } from "@/core/users/dtos/update-currentuser-password.dto";

export const updateMeRequest = async (
	cookie: string,
	body: IUpdateCurrentUserInfoDto
): Promise<Response> => {
	return await request(app)
		.patch("/api/users/update-me")
		.set("Cookie", cookie)
		.send(body);
};

export const updateMePasswordRequest = async (
	cookie: string,
	body: IUpdateCurrentUserPasswordDto
): Promise<Response> => {
	return await request(app)
		.patch("/api/users/update-me-password")
		.set("Cookie", cookie)
		.send(body);
};
