import { allUsersRequest } from "@/__tests__/helpers/admin.helper";
import { signupRequest } from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";

let cookie: string;
let adminCookie: string;

beforeEach(async () => {
	// Regular user cookie building
	const res = await signupRequest({
		name: "user",
		email: "user@example.com",
		password: "password",
		passwordConfirmation: "password",
	});
	cookie = res.headers["set-cookie"][0];

	// Admin cookie building
	const adminRes = await signupRequest({
		name: "admin",
		email: "admin@example.com",
		password: "password",
		passwordConfirmation: "password",
	});
	adminCookie = adminRes.headers["set-cookie"][0];
	const user = await userRepository.findByEmail(
		"admin@example.com"
	);
	user!.role = "admin";
	await user!.save({ validateBeforeSave: false });
});

describe("GET /api/users", () => {
	describe("Authorization", () => {
		it("should return 401 if no token is provided", async () => {
			const res = await allUsersRequest("");
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("should return 401 if user's role is not admin", async () => {
			const res = await allUsersRequest(cookie);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("Success", () => {
		it("should return 200 with all users", async () => {
			const res = await allUsersRequest(adminCookie);
			expect(res.status).toBe(200);
		});
	});
});
