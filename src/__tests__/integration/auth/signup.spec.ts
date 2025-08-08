import { signupRequest, getUniqueUser } from "@/__tests__/helpers/auth.helper";

const validationCases = [
	{
		testCaseName: "Name is not provided",
		user: {
			name: "",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "password",
		},
		error: "نام کاربر الزامی است",
	},
	{
		testCaseName: "Email is not provided",
		user: {
			name: "test",
			email: "",
			password: "password",
			passwordConfirmation: "password",
		},
		error: "ایمیل کاربر الزامی است",
	},
	{
		testCaseName: "Password is not provided",
		user: {
			name: "test",
			email: "test@test.com",
			password: "",
			passwordConfirmation: "password",
		},
		error: "رمز عبور کاربر الزامی است",
	},
	{
		testCaseName: "Password confirmation is not provided",
		user: {
			name: "test",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "",
		},
		error: "تایید رمز عبور کاربر الزامی است",
	},
];

describe("POST /api/users/signup", () => {
	describe("should return 400, if", () => {
		validationCases.forEach(({ testCaseName, user, error }) => {
			it(testCaseName, async () => {
				const res = await signupRequest(user);

				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBe(error);
			});
		});

		it("Email is already in use", async () => {
			const user = getUniqueUser("user");
			await signupRequest(user);
			const res = await signupRequest(user);
			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("این ایمیل قبلا استفاده شده است");
		});
	});

	describe("should return 201, if", () => {
		it("Signup is successful", async () => {
			const user = getUniqueUser("user");
			const res = await signupRequest(user);
			expect(res.status).toBe(201);
			expect(res.headers["set-cookie"]).toBeDefined();
		});
	});
});
