import { userRepository } from "../../core";
import { sendEmail } from "../../utils/email";
import {
	forgotPassword,
	login,
	resetPassword,
	signup,
} from "../helpers/auth-requests";
import { validUser } from "../helpers/setup";

const getUniqueUser = (suffix: string): typeof validUser => ({
	name: "test",
	email: `test${suffix}@test.com`,
	password: "test123456",
	passwordConfirmation: "test123456",
});

const signupAndRequestForgotPassword = async (
	user: typeof validUser,
): Promise<string> => {
	// Make the request to signup
	await signup(user);

	// Make the request to forgot password
	await forgotPassword({ email: user.email });

	// Get the reset token from the mocked email
	const mockSendEmail = sendEmail as jest.MockedFunction<
		typeof sendEmail
	>;
	const emailCall = mockSendEmail.mock.calls[0];
	const url = emailCall[1] as string;

	// Return the reset token
	return url.split("/").pop()!;
};

const validationCases = [
	{
		testCaseName:
			"should return 400 if the password is not provided",
		body: { password: "", passwordConfirmation: "123456" },
		query: { resetToken: "123456" },
	},
	{
		testCaseName:
			"should return 400 if the password confirmation is not provided",
		body: { password: "123456", passwordConfirmation: "" },
		query: { resetToken: "123456" },
	},
	{
		testCaseName:
			"should return 400 if the password and password confirmation are not the same",
		body: {
			password: "123456",
			passwordConfirmation: "1234567",
		},
		query: { resetToken: "123456" },
	},
	{
		testCaseName:
			"should return 400 if the reset token is not provided",
		body: { password: "123456", passwordConfirmation: "123456" },
		query: { resetToken: "" },
	},
];

describe("PATCH /api/users/reset-password", () => {
	beforeEach(() => {
		(
			sendEmail as jest.MockedFunction<typeof sendEmail>
		).mockClear();
	});

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
			// Create a user first
			const user = getUniqueUser("test1");

			// Make the request to signup and forgot password
			await signupAndRequestForgotPassword(user);

			// Make the request to reset password with an invalid token
			const res = await resetPassword(
				{
					password: "test123456",
					passwordConfirmation: "test123456",
				},
				{ resetToken: "invalid-token" },
			);

			// Due to the reset token is invalid, the request should return 401
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBeDefined();
		});

		it("should return 401 if the reset token is expired", async () => {
			// Create a user first
			const user = getUniqueUser("test2");

			// Make the request to signup and forgot password
			const resetToken =
				await signupAndRequestForgotPassword(user);

			// Get the user from the database and update the reset token expiration time to 1 second ago
			const dbUser = await userRepository.findByEmail(
				user.email,
			);
			dbUser!.passwordResetExpires = Date.now() - 1000;
			await dbUser!.save({ validateBeforeSave: false });

			// Make the request to reset password with the expired token
			const res = await resetPassword(
				{
					password: "test123456",
					passwordConfirmation: "test123456",
				},
				{ resetToken },
			);

			// Due to the reset token is expired, the request should return 401
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBeDefined();
		});
	});

	describe("Success", () => {
		it("should reset password successfully", async () => {
			// Create a user first
			const user = getUniqueUser("test3");

			// Make the request to signup and forgot password
			const resetToken =
				await signupAndRequestForgotPassword(user);

			// Make the request to reset password with the reset token
			const newPassword = "newpassword123";
			const resetPasswordRes = await resetPassword(
				{
					password: newPassword,
					passwordConfirmation: newPassword,
				},
				{ resetToken },
			);

			// Due to the reset password is successful, the request should return 200
			expect(resetPasswordRes.status).toBe(200);
		});

		it("should return 200 if the login with the new password is successful", async () => {
			// Create a user first
			const user = getUniqueUser("test2");

			// Make the request to signup and forgot password
			const resetToken =
				await signupAndRequestForgotPassword(user);

			// Make the request to reset password with the reset token
			const newPassword = "newpassword123";
			await resetPassword(
				{
					password: newPassword,
					passwordConfirmation: newPassword,
				},
				{ resetToken },
			);

			// Make the request to login with the new password
			const loginRes = await login({
				email: user.email,
				password: newPassword,
			});

			// Due to the login with the new password is successful, the request should return 200
			expect(loginRes.status).toBe(200);
		});

		it("should return 401 if the login with the old password is unsuccessful", async () => {
			// Create a user first
			const user = getUniqueUser("test4");

			// Make the request to signup and forgot password
			const resetToken =
				await signupAndRequestForgotPassword(user);

			// Make the request to reset password with the reset token
			const newPassword = "newpassword123";
			await resetPassword(
				{
					password: newPassword,
					passwordConfirmation: newPassword,
				},
				{ resetToken },
			);

			// Make the request to login with the old password
			const oldLoginRes = await login({
				email: user.email,
				password: user.password,
			});

			// Due to the old password no longer works, the request should return 401
			expect(oldLoginRes.status).toBe(401);
		});
	});
});
