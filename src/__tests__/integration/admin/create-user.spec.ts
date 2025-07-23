import { createUserRequest } from "@/__tests__/helpers/admin.helper";
import {
	getInvalidToken,
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { updateMePasswordRequest } from "@/__tests__/helpers/users.helper";
import { userRepository } from "@/core";

const validationCases = [
	{
		description: "If the name is not provided",
		body: {
			name: "",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "password",
		},
		error: "نام کاربر الزامی است",
		field: "name",
	},
	{
		description: "If the request body is invalid",
		body: {
			name: "test",
			email: "",
			password: "password",
			passwordConfirmation: "password",
		},
		error: "ایمیل کاربر الزامی است",
		field: "email",
	},
	{
		description: "If the password is not provided",
		body: {
			name: "test",
			email: "test@test.com",
			password: "",
			passwordConfirmation: "password",
		},
		error: "رمز عبور کاربر الزامی است",
		field: "password",
	},
	{
		description: "If the password confirmation is not provided",
		body: {
			name: "test",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "",
		},
		error: "تایید رمز عبور کاربر الزامی است",
		field: "passwordConfirmation",
	},
	{
		description:
			"If the password and password confirmation do not match",
		body: {
			name: "test",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "password1",
		},
		error: "رمز عبور و تایید رمز عبور باید یکسان باشد",
		field: "passwordConfirmation",
	},
];

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

describe("POST /api/users", () => {
	describe("should return 401", () => {
		it("If no token is provided", async () => {
			const newUser = getUniqueUser("new-user");
			const res = await createUserRequest("", newUser);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("If token is invalid", async () => {
			const user = getUniqueUser("user");
			const res = await createUserRequest(
				"jwt=invalid-token",
				user
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("If user for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const user = getUniqueUser("user");
			const res = await createUserRequest(
				`jwt=${fakeToken}`,
				user
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
			const res = await createUserRequest(cookie, user);
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

			const user = getUniqueUser("changed-password");
			const res = await createUserRequest(userCookie, user);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید."
			);
		});

		it("If user is not an admin", async () => {
			const newUser = getUniqueUser("new-user");
			const res = await createUserRequest(userCookie, newUser);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("should return 400", () => {
		validationCases.forEach(
			({ description, body, error, field }) => {
				it(description, async () => {
					const res = await createUserRequest(adminCookie, body);
					expect(res.status).toBe(400);
					expect(res.body.errors[0].field).toBe(field);
					expect(res.body.errors[0].message).toBe(error);
				});
			}
		);

		it("If the email is already in use", async () => {
			const newUser = getUniqueUser("new-user");
			await createUserRequest(adminCookie, newUser);
			const res = await createUserRequest(adminCookie, newUser);
			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"این ایمیل قبلا استفاده شده است"
			);
		});
	});

	describe("should return 201", () => {
		it("If user is admin", async () => {
			const newUser = getUniqueUser("new-user");
			const res = await createUserRequest(adminCookie, newUser);
			expect(res.status).toBe(201);
			expect(res.body.data.user).toBeDefined();
		});
	});
});
