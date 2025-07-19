import app from "@/app";
import request, { Response } from "supertest";

export const getMe = async (cookie: string): Promise<Response> => {
	return await request(app).get("/api/users/get-me").set("Cookie", cookie);
};
