import { User } from "../../core";
import { sendEmail } from "../../utils/email";
import {
	forgotPassword,
	signup,
} from "../helpers/auth-requests";
import { validUser } from "../helpers/setup";

const validationCases = [
	{
		testCaseName: "should return 400 if email is not provided",
		user: { email: "" },
	},
	{
		testCaseName: "should return 400 if email is not valid",
		user: { email: "invalid-email" },
	},
];

describe("POST /api/users/forgot-password", () => {
	describe("validation dto", () => {
		validationCases.forEach(({ testCaseName, user }) => {
			it(testCaseName, async () => {
				const res = await forgotPassword(user);
				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBeDefined();
			});
		});
	});

	describe("business logic", () => {
		it("should return 404 if user is not found", async () => {
			const res = await forgotPassword({
				email: "test@test.com",
			});
			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBeDefined();
		});

		it("should return 401 if user is not active", async () => {
			await signup(validUser);
			await User.updateOne(
				{ email: validUser.email },
				{ active: false },
			);
			const res = await forgotPassword({
				email: validUser.email,
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBeDefined();
		});
	});

	describe("success", () => {
		it("should send email and set passwordResetToken and passwordResetExpires", async () => {
			await signup(validUser);
			const res = await forgotPassword({
				email: validUser.email,
			});

			// check if the response is 200
			expect(res.status).toBe(200);
			expect(res.body.message).toBeDefined();

			// check if sendEmail was called with the correct arguments
			expect(sendEmail).toHaveBeenCalledWith(
				validUser.email,
				expect.any(String),
				"درخواست برای ریست کردن رمز عبور",
			);

			// check if the user has a passwordResetToken and passwordResetExpires
			const user = await User.findOne({
				email: validUser.email,
			});
			expect(user!.passwordResetToken).toBeDefined();
			expect(user!.passwordResetExpires).toBeDefined();
		});
	});
});
