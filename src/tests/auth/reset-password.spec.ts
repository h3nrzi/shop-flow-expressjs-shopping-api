import { sendEmail } from "../../utils/email";
import { forgotPassword, login, resetPassword, signup } from "../helpers/auth.requests";
import { validUser } from "../helpers/setup";

const validationCases = [
	{
		testCaseName: "should return 400 if the password is not provided",
		body: { password: "", passwordConfirmation: "123456" },
		query: { resetToken: "123456" },
	},
	{
		testCaseName: "should return 400 if the password confirmation is not provided",
		body: { password: "123456", passwordConfirmation: "" },
		query: { resetToken: "123456" },
	},
	{
		testCaseName: "should return 400 if the password and password confirmation are not the same",
		body: { password: "123456", passwordConfirmation: "1234567" },
		query: { resetToken: "123456" },
	},
	{
		testCaseName: "should return 400 if the reset token is not provided",
		body: { password: "123456", passwordConfirmation: "123456" },
		query: { resetToken: "" },
	},
];

describe("PATCH /api/users/reset-password", () => {
	describe("Validation DTO", () => {
		validationCases.forEach(({ testCaseName, body, query }) => {
			it(testCaseName, async () => {
				const res = await resetPassword(body, query);
				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBeDefined();
			});
		});
	});

	describe("Business Logic", () => {
		it("should return 401 if the reset token is not valid", async () => {
			const res = await resetPassword(
				{
					password: "test123456",
					passwordConfirmation: "test123456",
				},
				{ resetToken: "123456" }
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBeDefined();
		});
	});

	describe("Success", () => {
		it("should login with the new password and old password should not work", async () => {
			// 1. Create a user first
			await signup(validUser);

			// 2. Call forgot password to generate reset token
			await forgotPassword({ email: validUser.email });

			// 3. Get the original reset token from the mocked email
			const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
			const emailCall = mockSendEmail.mock.calls[0];
			const url = emailCall[1] as string;
			const resetToken = url.split("/").pop()!;

			// 4. Reset password with the token
			const newPassword = "newpassword123";
			await resetPassword(
				{
					password: newPassword,
					passwordConfirmation: newPassword,
				},
				{ resetToken }
			);

			// 5. Verify the password was changed by trying to login with new password
			const loginRes = await login({
				email: validUser.email,
				password: newPassword,
			});
			expect(loginRes.status).toBe(200);

			// 6. Verify old password no longer works
			const oldLoginRes = await login({
				email: validUser.email,
				password: validUser.password,
			});
			expect(oldLoginRes.status).toBe(401);
		});
	});
});
