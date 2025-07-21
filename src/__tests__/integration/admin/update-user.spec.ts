import { updateUserRequest } from "@/__tests__/helpers/admin.helper";
import {
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";
import mongoose from "mongoose";

const validationCases = [
	{
		description: "should return 400 if the id is invalid",
		userId: "invalid-id",
		body: { name: "new name" },
		status: 400,
		error: "شناسه کاربر معتبر نیست",
	},
	{
		description: "should return 400 if the name is not a string",
		body: { name: 123 },
		status: 400,
		error: "فرمت نام کاربر معتبر نیست",
	},
	{
		description: "should return 400 if the email is not valid",
		body: { email: "not-an-email" },
		status: 400,
		error: "فرمت ایمیل کاربر معتبر نیست",
	},
	{
		description:
			"should return 400 if the photo is not a string",
		body: { photo: 123 },
		status: 400,
		error: "فرمت تصویر کاربر معتبر نیست",
	},
	{
		description:
			"should return 400 if the active is not a boolean",
		body: { active: "yes" },
		status: 400,
		error: "فرمت وضعیت کاربر معتبر نیست",
	},
];

let userCookie: string;
let adminCookie: string;
let mainAdminCookie: string;
let userId: string;
let adminId: string;
let mainAdminId: string;

beforeEach(async () => {
	// Create a normal user
	const user = getUniqueUser("user");
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
	adminId = adminUser!._id.toString();

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
	mainAdminId = mainAdminUser!._id.toString();
});

describe("PATCH /api/users/:id", () => {
	describe("Authorization", () => {
		it("should return 401 if no token is provided", async () => {
			const res = await updateUserRequest("", userId, {
				name: "new name",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("should return 401 if the user is not an admin", async () => {
			const res = await updateUserRequest(userCookie, userId, {
				name: "new name",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("Validation", () => {
		validationCases.forEach(testCase => {
			it(testCase.description, async () => {
				const id = testCase.userId || userId;
				const res = await updateUserRequest(
					adminCookie,
					id,
					testCase.body as any
				);
				expect(res.status).toBe(testCase.status);
				expect(res.body.errors[0].message).toBe(testCase.error);
			});
		});
	});

	describe("Business Logic", () => {
		it("should return 404 if the user does not exist", async () => {
			const nonExistentId = new mongoose.Types.ObjectId();
			const res = await updateUserRequest(
				adminCookie,
				nonExistentId.toString(),
				{ name: "new name" }
			);
			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe(
				"هیچ موردی با این شناسه یافت نشد"
			);
		});

		it("should return 400 if the email is already in use", async () => {
			// Create a second admin with the same email
			const admin = getUniqueUser("going-to-be-admin");
			await signupRequest(admin);
			const admin2Doc = await userRepository.findByEmail(
				admin.email
			);
			admin2Doc!.role = "admin";
			await admin2Doc!.save({ validateBeforeSave: false });
			const adminId2 = admin2Doc!._id.toString();

			// Try to update the admin to have the same email as the main admin
			const res = await updateUserRequest(
				mainAdminCookie,
				adminId2,
				{ email: "admin@gmail.com" }
			);

			// Due to the fact that the admin is already in the database, the update will fail
			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"این ایمیل قبلا استفاده شده است"
			);
		});

		it("should return 401 if an admin tries to update another admin (not main admin)", async () => {
			// admin tries to update main admin
			const res = await updateUserRequest(
				adminCookie,
				mainAdminId,
				{ name: "Hacker" }
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما نمی توانید حساب ادمین را آپدیت کنید فقط مدیر سیستم می تواند این کار را انجام دهد"
			);
		});
	});

	describe("Success", () => {
		it("should update a user as admin", async () => {
			const res = await updateUserRequest(adminCookie, userId, {
				name: "Updated Name",
			});
			expect(res.status).toBe(200);
			expect(res.body.data.user.name).toBe("Updated Name");
		});

		it("should update an admin as main admin", async () => {
			const res = await updateUserRequest(
				mainAdminCookie,
				adminId,
				{ name: "Admin Updated" }
			);
			expect(res.status).toBe(200);
			expect(res.body.data.user.name).toBe("Admin Updated");
		});

		it("should update the main admin as main admin", async () => {
			const res = await updateUserRequest(
				mainAdminCookie,
				mainAdminId,
				{ name: "Main Admin Updated" }
			);
			expect(res.status).toBe(200);
			expect(res.body.data.user.name).toBe("Main Admin Updated");
		});
	});
});
