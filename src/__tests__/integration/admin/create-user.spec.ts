import { createUserRequest } from "@/__tests__/helpers/admin.helper";
import {
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";

const validationCases = [
	{
		description: "should return 400 if the name is not provided",
		body: {
			name: "",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "password",
		},
		status: 400,
		error: "نام کاربر الزامی است",
	},
	{
		description:
			"should return 400 if the request body is invalid",
		body: {
			name: "test",
			email: "",
			password: "password",
			passwordConfirmation: "password",
		},
		status: 400,
		error: "ایمیل کاربر الزامی است",
	},
	{
		description:
			"should return 400 if the password is not provided",
		body: {
			name: "test",
			email: "test@test.com",
			password: "",
			passwordConfirmation: "password",
		},
		status: 400,
		error: "رمز عبور کاربر الزامی است",
	},
	{
		description:
			"should return 400 if the password confirmation is not provided",
		body: {
			name: "test",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "",
		},
		status: 400,
		error: "تایید رمز عبور کاربر الزامی است",
	},
	{
		description:
			"should return 400 if the password and password confirmation do not match",
		body: {
			name: "test",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "password1",
		},
		status: 400,
		error: "رمز عبور و تایید رمز عبور باید یکسان باشد",
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
	describe("Authorization", () => {
		it("should return 401 if no token is provided", async () => {
			const newUser = getUniqueUser("new-user");
			const res = await createUserRequest("", newUser);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("should return 401 if the user is not an admin", async () => {
			const newUser = getUniqueUser("new-user");
			const res = await createUserRequest(userCookie, newUser);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("Validation", () => {
		validationCases.forEach(
			({ description, body, status, error }) => {
				it(description, async () => {
					const res = await createUserRequest(adminCookie, body);
					expect(res.status).toBe(status);
					expect(res.body.errors[0].message).toBe(error);
				});
			}
		);
	});

	describe("Business Logic", () => {
		it("should return 400 if the email is already in use", async () => {
			const newUser = getUniqueUser("new-user");
			await createUserRequest(adminCookie, newUser);
			const res = await createUserRequest(adminCookie, newUser);
			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"این ایمیل قبلا استفاده شده است"
			);
		});
	});

	describe("Success", () => {
		it("should return 201 with the new user", async () => {
			const newUser = getUniqueUser("new-user");
			const res = await createUserRequest(adminCookie, newUser);
			expect(res.status).toBe(201);
			expect(res.body.data.user).toBeDefined();
		});
	});
});
