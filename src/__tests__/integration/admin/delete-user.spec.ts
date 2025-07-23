import { deleteUserRequest } from "@/__tests__/helpers/admin.helper";
import {
	getInvalidToken,
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { updateMePasswordRequest } from "@/__tests__/helpers/users.helper";
import { userRepository } from "@/core";
import mongoose from "mongoose";

let user: ReturnType<typeof getUniqueUser>;
let userCookie: string;
let adminCookie: string;
let mainAdminCookie: string;
let userId: string;
let adminId: string;
let mainAdminId: string;

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

describe("DELETE /api/users/:id", () => {
	describe("should return 401", () => {
		it("If no token is provided", async () => {
			const res = await deleteUserRequest("", userId);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("If token is invalid", async () => {
			const res = await deleteUserRequest(
				"jwt=invalid-token",
				userId
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("If user for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const res = await deleteUserRequest(
				`jwt=${fakeToken}`,
				userId
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

			const res = await deleteUserRequest(cookie, userId);

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

			const res = await deleteUserRequest(userCookie, userId);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید."
			);
		});

		it("If user's role is not admin", async () => {
			const res = await deleteUserRequest(userCookie, userId);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});

		it("If an admin tries to delete another admin", async () => {
			const res = await deleteUserRequest(adminCookie, adminId);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما نمی توانید حساب ادمین را حذف کنید فقط مدیر سیستم می تواند این کار را انجام دهد"
			);
		});

		it("If an admin tries to delete the main admin", async () => {
			const res = await deleteUserRequest(
				adminCookie,
				mainAdminId
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما نمی توانید حساب ادمین را حذف کنید فقط مدیر سیستم می تواند این کار را انجام دهد"
			);
		});
	});

	describe("should return 400", () => {
		it("If userId is invalid", async () => {
			const res = await deleteUserRequest(
				adminCookie,
				"invalid-id"
			);
			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"شناسه کاربر معتبر نیست"
			);
		});
	});

	describe("should return 404", () => {
		it("If user does not exist", async () => {
			const nonExistentId =
				new mongoose.Types.ObjectId().toString();
			const res = await deleteUserRequest(
				adminCookie,
				nonExistentId
			);
			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe(
				"هیچ موردی با این شناسه یافت نشد"
			);
		});
	});

	describe("should return 204", () => {
		it("If user is admin and wants to delete a normal user", async () => {
			const res = await deleteUserRequest(adminCookie, userId);
			expect(res.status).toBe(204);
			const deletedUser = await userRepository.findByEmail(
				user.email
			);
			expect(deletedUser).toBeNull();
		});

		it("If user is main admin and wants to delete an normal admin", async () => {
			const res = await deleteUserRequest(
				mainAdminCookie,
				adminId
			);
			expect(res.status).toBe(204);
			const deletedAdmin = await userRepository.findByEmail(
				`testadmin@test.com`
			);
			expect(deletedAdmin).toBeNull();
		});

		it("If user is main admin and wants to delete the main admin", async () => {
			const res = await deleteUserRequest(
				mainAdminCookie,
				mainAdminId
			);
			expect(res.status).toBe(204);
			const deletedMainAdmin = await userRepository.findByEmail(
				"admin@gmail.com"
			);
			expect(deletedMainAdmin).toBeNull();
		});
	});
});
