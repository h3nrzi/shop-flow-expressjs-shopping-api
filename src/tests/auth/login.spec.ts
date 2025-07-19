import { login, signup } from "../helpers/auth-requests";

const validationCases = [
	{
		testCaseName: "should return 400 if email is not provided",
		user: {
			email: "",
			password: "password",
		},
	},
	{
		testCaseName:
			"should return 400 if password is not provided",
		user: {
			email: "test@test.com",
			password: "",
		},
	},
];

const validUser = {
	email: "test@test.com",
	password: "password",
};

describe("POST /api/users/signin", () => {
	describe("validation dto", () => {
		validationCases.forEach(({ testCaseName, user }) => {
			it(testCaseName, async () => {
				const res = await login(user);
				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBeDefined();
			});
		});
	});

	describe("business logic", () => {
		it("should return 401 if email is not found", async () => {
			const res = await login(validUser);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBeDefined();
		});

		it.todo("should return 401 if user is not active");

		it("should return 401 if password is incorrect", async () => {
			await signup({
				name: "test",
				email: validUser.email,
				password: "wrong-password",
				passwordConfirmation: "wrong-password",
			});
			const res = await login(validUser);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBeDefined();
		});
	});

	describe("success", () => {
		it("should return 200 and a cookie if login is successful", async () => {
			await signup({
				name: "test",
				email: validUser.email,
				password: validUser.password,
				passwordConfirmation: validUser.password,
			});
			const res = await login(validUser);
			expect(res.status).toBe(200);
			expect(res.headers["set-cookie"]).toBeDefined();
		});
	});
});
