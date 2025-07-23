import { updateUserRequest } from "@/__tests__/helpers/admin.helper";
import {
	getInvalidToken,
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { updateMePasswordRequest } from "@/__tests__/helpers/users.helper";
import { userRepository } from "@/core";
import mongoose from "mongoose";

const validationCases = [
	{
		description: "If the id is invalid",
		userId: "invalid-id",
		body: { name: "new name" },
		status: 400,
		error: "شناسه کاربر معتبر نیست",
	},
	{
		description: "If the name is not a string",
		body: { name: 123 },
		status: 400,
		error: "فرمت نام کاربر معتبر نیست",
	},
	{
		description: "If the email is not valid",
		body: { email: "not-an-email" },
		status: 400,
		error: "فرمت ایمیل کاربر معتبر نیست",
	},
	{
		description: "If the photo is not a string",
		body: { photo: 123 },
		status: 400,
		error: "فرمت تصویر کاربر معتبر نیست",
	},
	{
		description: "If the active is not a boolean",
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
	describe("should return 401", () => {
		it("If no token is provided", async () => {
			const res = await updateUserRequest("", userId, {
				name: "new name",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("If token is invalid", async () => {
			const res = await updateUserRequest(
				"jwt=invalid-token",
				userId,
				{ name: "new name" }
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("If user for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const res = await updateUserRequest(
				`jwt=${fakeToken}`,
				userId,
				{ name: "new name" }
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!"
			);
		});

		it("If user is inactive", async () => {
			const user = getUniqueUser("inactive");
			const signupRes = await signupRequest(user);
			const cookie = signupRes.headers["set-cookie"][0];
			const repoUser = await userRepository.findByEmail(
				user.email
			);
			repoUser!.active = false;
			await repoUser!.save({ validateBeforeSave: false });
			const res = await updateUserRequest(cookie, userId, {
				name: "new name",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربری که به این ایمیل مرتبط است غیرفعال شده!"
			);
		});

		it("If user changed password after token was issued", async () => {
			await updateMePasswordRequest(userCookie, {
				passwordCurrent: "test123456",
				password: "newpassword123",
				passwordConfirmation: "newpassword123",
			});

			await new Promise(resolve => setTimeout(resolve, 500));

			const res = await updateUserRequest(userCookie, userId, {
				name: "new name",
			});

			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید."
			);
		});

		it("If user's role is not admin", async () => {
			const res = await updateUserRequest(userCookie, userId, {
				name: "new name",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});

		it("If an admin tries to update another admin", async () => {
			const res = await updateUserRequest(adminCookie, adminId, {
				name: "Hacker",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما نمی توانید حساب ادمین را آپدیت کنید فقط مدیر سیستم می تواند این کار را انجام دهد"
			);
		});

		it("If an admin tries to update the main admin", async () => {
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

	describe("should return 400", () => {
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

		it("If the email is already in use", async () => {
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
	});

	describe("should return 404", () => {
		it("If the user does not exist", async () => {
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
	});

	describe("should return 200", () => {
		it("If admin wants to update a normal user", async () => {
			const res = await updateUserRequest(adminCookie, userId, {
				name: "Updated Name",
			});
			expect(res.status).toBe(200);
			expect(res.body.data.user).toBeDefined();
		});

		it("If main admin wants to update another admin", async () => {
			const res = await updateUserRequest(
				mainAdminCookie,
				adminId,
				{ name: "Admin Updated" }
			);
			expect(res.status).toBe(200);
			expect(res.body.data.user).toBeDefined();
		});

		it("If main admin wants to update himself", async () => {
			const res = await updateUserRequest(
				mainAdminCookie,
				mainAdminId,
				{ name: "Main Admin Updated" }
			);
			expect(res.status).toBe(200);
			expect(res.body.data.user).toBeDefined();
		});
	});
});
