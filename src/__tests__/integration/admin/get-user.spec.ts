import { getUserRequest } from "@/__tests__/helpers/admin.helper";
import {
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";
import mongoose from "mongoose";

let user: ReturnType<typeof getUniqueUser>;
let userCookie: string;
let adminCookie: string;
let mainAdminCookie: string;
let userId: string;

const validationCases = [
	{
		description: "should return 400 if the id is invalid",
		params: { id: "invalid-id" },
		expectedMessage: "شناسه کاربر معتبر نیست",
	},
];

beforeEach(async () => {
	// Create a normal user
	user = getUniqueUser("user");
	const userRes = await signupRequest(user);
	userCookie = userRes.headers["set-cookie"][0];
	const userDoc = await userRepository.findByEmail(user.email);
	userId = userDoc!._id.toString();

	// Create an admin user
	const admin = getUniqueUser("admin");
	const adminRes = await signupRequest(admin);
	adminCookie = adminRes.headers["set-cookie"][0];
	const adminUser = await userRepository.findByEmail(
		admin.email
	);
	adminUser!.role = "admin";
	await adminUser!.save({ validateBeforeSave: false });

	// Create the main admin (admin@gmail.com)
	const mainAdmin = {
		name: "Main Admin",
		email: "admin@gmail.com",
		password: "test123456",
		passwordConfirmation: "test123456",
	};
	const mainAdminRes = await signupRequest(mainAdmin);
	mainAdminCookie = mainAdminRes.headers["set-cookie"][0];
	const mainAdminUser = await userRepository.findByEmail(
		mainAdmin.email
	);
	mainAdminUser!.role = "admin";
	await mainAdminUser!.save({ validateBeforeSave: false });
});

describe("GET /api/users/:id", () => {
	describe("Authorization", () => {
		it("should return 401 if no token is provided", async () => {
			const res = await getUserRequest("", userId);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("should return 401 if the user is not an admin", async () => {
			const res = await getUserRequest(userCookie, userId);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("Validation", () => {
		validationCases.forEach(
			({ description, params, expectedMessage }) => {
				it(description, async () => {
					const res = await getUserRequest(
						adminCookie,
						params.id
					);
					expect(res.status).toBe(400);
					expect(res.body.errors[0].message).toBe(
						expectedMessage
					);
				});
			}
		);
	});

	describe("Business Logic", () => {
		it("should return 404 if the user does not exist", async () => {
			const nonExistentId = new mongoose.Types.ObjectId();
			const res = await getUserRequest(
				adminCookie,
				nonExistentId.toString()
			);
			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe(
				"هیچ موردی با این شناسه یافت نشد"
			);
		});
	});

	describe("Success", () => {
		it("should return 200 and user data for admin", async () => {
			const res = await getUserRequest(adminCookie, userId);
			expect(res.status).toBe(200);
			expect(res.body.data.user).toBeDefined();
		});

		it("should return 200 and user data for main admin", async () => {
			const res = await getUserRequest(mainAdminCookie, userId);
			expect(res.status).toBe(200);
			expect(res.body.data.user).toBeDefined();
		});
	});
});
