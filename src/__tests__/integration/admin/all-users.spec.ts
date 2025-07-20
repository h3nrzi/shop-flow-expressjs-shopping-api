import { allUsersRequest } from "@/__tests__/helpers/admin.helper";
import {
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";

let userCookie: string;
let adminCookie: string;

beforeEach(async () => {
	// User cookie building
	const user = getUniqueUser("user");
	const res = await signupRequest(user);
	userCookie = res.headers["set-cookie"][0];

	// Admin cookie building
	const admin = getUniqueUser("admin");
	const adminRes = await signupRequest(admin);
	adminCookie = adminRes.headers["set-cookie"][0];
	const adminUser = await userRepository.findByEmail(
		admin.email
	);
	adminUser!.role = "admin";
	await adminUser!.save({ validateBeforeSave: false });
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
			const res = await allUsersRequest(userCookie);
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
