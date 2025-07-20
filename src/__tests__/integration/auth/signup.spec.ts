import {
	signupRequest,
	validUser,
} from "@/__tests__/helpers/auth.helper";

const validationCases = [
	{
		testCaseName: "should return 400 if name is not provided",
		user: {
			name: "",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "password",
		},
	},
	{
		testCaseName: "should return 400 if email is not provided",
		user: {
			name: "test",
			email: "",
			password: "password",
			passwordConfirmation: "password",
		},
	},
	{
		testCaseName:
			"should return 400 if password is not provided",
		user: {
			name: "test",
			email: "test@test.com",
			password: "",
			passwordConfirmation: "password",
		},
	},
	{
		testCaseName:
			"should return 400 if passwordConfirmation is not provided",
		user: {
			name: "test",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "",
		},
	},
];

describe("POST /api/users/signup", () => {
	describe("validation dto", () => {
		validationCases.forEach(({ testCaseName, user }) => {
			it(testCaseName, async () => {
				const res = await signupRequest(user);

				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBeDefined();
			});
		});
	});

	describe("success", () => {
		it("should return 201 and a cookie if signup is successful", async () => {
			const res = await signupRequest(validUser);
			expect(res.status).toBe(201);
			expect(res.headers["set-cookie"]).toBeDefined();
		});
	});

	describe("business logic", () => {
		it("should return 400 if email is already in use", async () => {
			await signupRequest(validUser);
			const res = await signupRequest(validUser);
			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBeDefined();
		});
	});
});
