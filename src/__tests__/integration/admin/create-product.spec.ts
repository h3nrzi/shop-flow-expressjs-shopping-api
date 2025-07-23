import { createProductRequest } from "@/__tests__/helpers/admin.helper";
import {
	getInvalidToken,
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { validProduct } from "@/__tests__/helpers/products.helper";
import { updateMePasswordRequest } from "@/__tests__/helpers/users.helper";
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

describe("POST /api/admin/products", () => {
	describe("should return 401", () => {
		it("If no token is provided", async () => {
			const res = await createProductRequest("", validProduct);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("If token is invalid", async () => {
			const res = await createProductRequest(
				"jwt=invalid-token",
				validProduct
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("If user for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const res = await createProductRequest(
				`jwt=${fakeToken}`,
				validProduct
			);
			expect(res.status).toBe(401);
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
			const res = await createProductRequest(
				cookie,
				validProduct
			);
			expect(res.status).toBe(401);
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

			const res = await createProductRequest(
				userCookie,
				validProduct
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید."
			);
		});

		it("If user's role is not admin", async () => {
			const res = await createProductRequest(
				userCookie,
				validProduct
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("should return 201", () => {
		it("If user is admin", async () => {
			const res = await createProductRequest(
				adminCookie,
				validProduct
			);
			expect(res.status).toBe(201);
		});
	});
});
