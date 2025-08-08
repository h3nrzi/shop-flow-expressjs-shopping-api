import {
	getUniqueUser,
	loginRequest,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";

const validationCases = [
	{
		testCaseName: "Email is not provided",
		body: {
			email: "",
			password: "password",
		},
		error: "ایمیل کاربر الزامی است",
	},
	{
		testCaseName: "Email is not valid",
		body: {
			email: "user@test",
			password: "password",
		},
		error: "فرمت ایمیل وارد شده معتبر نیست",
	},
	{
		testCaseName: "Password is not provided",
		body: {
			email: "test@test.com",
			password: "",
		},
		error: "رمز عبور کاربر الزامی است",
	},
	{
		testCaseName: "Password is not valid",
		body: {
			email: "test@test.com",
			password: 123 as unknown as string,
		},
		error: "فرمت رمز عبور کاربر باید string باشد",
	},
];

describe("POST /api/users/signin", () => {
	describe("should return 400, if", () => {
		validationCases.forEach(({ testCaseName, body, error }) => {
			it(testCaseName, async () => {
				const res = await loginRequest(body);
				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBe(error);
			});
		});
	});

	describe("should return 401, if", () => {
		it("User is not active", async () => {
			const user = getUniqueUser("user");
			await signupRequest(user);
			const userDoc = await userRepository.findByEmail(user.email);
			userDoc!.active = false;
			await userDoc!.save({ validateBeforeSave: false });
			const res = await loginRequest(user);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربری که به این ایمیل مرتبط است مسدود شده است! لطفا با پشتیبانی تماس بگیرید.",
			);
		});

		it("User's credentials are incorrect (email)", async () => {
			const user = getUniqueUser("user");
			const res = await loginRequest(user);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("ایمیل یا رمز عبور اشتباه است!");
		});

		it("User's credentials are incorrect (password)", async () => {
			const user = getUniqueUser("user");
			await signupRequest(user);
			const res = await loginRequest({
				email: user.email,
				password: "wrong-password",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("ایمیل یا رمز عبور اشتباه است!");
		});
	});

	describe("should return 200, if", () => {
		it("Email is found, user is active and password is correct", async () => {
			const user = getUniqueUser("user");
			await signupRequest(user);
			const res = await loginRequest(user);
			expect(res.status).toBe(200);
			expect(res.headers["set-cookie"]).toBeDefined();
		});
	});
});
