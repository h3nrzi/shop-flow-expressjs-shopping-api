import { getUserRequest } from "@/__tests__/helpers/admin.helper";
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

const validationCases = [
	{
		description: "If the userId is invalid",
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
	describe("should return 401", () => {
		it("If no token is provided", async () => {
			const res = await getUserRequest("", userId);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("If token is invalid", async () => {
			const res = await getUserRequest(
				"jwt=invalid-token",
				userId
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("If user for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const res = await getUserRequest(
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
			const res = await getUserRequest(cookie, userId);
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

			const res = await getUserRequest(userCookie, userId);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید."
			);
		});

		it("If user's role is not admin", async () => {
			const res = await getUserRequest(userCookie, userId);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("should return 400", () => {
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

	describe("should return 404", () => {
		it("If the user does not exist", async () => {
			const nonExistentId = new mongoose.Types.ObjectId();
			const res = await getUserRequest(
				adminCookie,
				nonExistentId.toString()
			);
			expect(res.status).toBe(404);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"هیچ موردی با این شناسه یافت نشد"
			);
		});
	});

	describe("should return 200", () => {
		it("For admin", async () => {
			const res = await getUserRequest(adminCookie, userId);
			expect(res.status).toBe(200);
			expect(res.body.data.user).toBeDefined();
		});

		it("For main admin", async () => {
			const res = await getUserRequest(mainAdminCookie, userId);
			expect(res.status).toBe(200);
			expect(res.body.data.user).toBeDefined();
		});
	});
});
