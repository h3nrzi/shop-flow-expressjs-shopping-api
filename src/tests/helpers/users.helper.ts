import request, { Response } from "supertest";
import app from "@/app";

export const updateMeRequest = async (
	cookie: string,
	body: any
): Promise<Response> => {
	return await request(app)
		.patch("/api/users/update-me")
		.set("Cookie", cookie)
		.send(body);
};
