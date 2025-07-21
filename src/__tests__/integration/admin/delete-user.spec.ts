import { deleteUserRequest } from "@/__tests__/helpers/admin.helper";
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
	describe("Authorization", () => {
		it("should return 401 if no token is provided", async () => {
			const res = await deleteUserRequest("", userId);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("should return 401 if the user is not an admin", async () => {
			const res = await deleteUserRequest(userCookie, userId);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("Validation", () => {
		it("should return 400 if the id is invalid", async () => {
			const res = await deleteUserRequest(
				adminCookie,
				"invalid-id"
			);
			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"شناسه کاربر معتبر نیست"
			);
		});

		it("should return 404 if the user does not exist", async () => {
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

	describe("Business Logic", () => {
		it("should return 401 if an admin tries to delete another admin (not main admin)", async () => {
			// admin tries to delete main admin
			const res = await deleteUserRequest(
				adminCookie,
				mainAdminId
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما نمی توانید حساب ادمین را حذف کنید فقط مدیر سیستم می تواند این کار را انجام دهد"
			);
		});
	});

	describe("Success", () => {
		it("should delete a user as admin", async () => {
			const res = await deleteUserRequest(adminCookie, userId);
			expect(res.status).toBe(204);
			// Optionally, check that the user is actually deleted
			const deletedUser = await userRepository.findByEmail(
				user.email
			);
			expect(deletedUser).toBeNull();
		});

		it("should delete an admin as main admin", async () => {
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

		it("should delete the main admin as main admin", async () => {
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
