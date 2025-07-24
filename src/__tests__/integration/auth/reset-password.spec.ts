import {
	getUniqueUser,
	loginRequest,
	resetPasswordRequest,
	signupAndRequestForgotPassword,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";
import { sendEmail } from "@/utils/email";

const validationCases = [
	{
		testCaseName: "Password is not provided",
		body: { password: "", passwordConfirmation: "test123456" },
		query: { resetToken: "123456" },
		error: "رمز عبور کاربر الزامی است",
	},
	{
		testCaseName: "Password confirmation is not provided",
		body: { password: "test123456", passwordConfirmation: "" },
		query: { resetToken: "123456" },
		error: "تایید رمز عبور کاربر الزامی است",
	},
	{
		testCaseName:
			"Password and password confirmation are not the same",
		body: {
			password: "test123456",
			passwordConfirmation: "1234567",
		},
		query: { resetToken: "123456" },
		error: "رمز عبور و تایید رمز عبور باید یکسان باشد",
	},
	{
		testCaseName: "Reset token is not provided",
		body: {
			password: "test123456",
			passwordConfirmation: "test123456",
		},
		query: { resetToken: "" },
		error: "ریست توکن کاربر الزامی است",
	},
];

describe("PATCH /api/users/reset-password", () => {
	beforeEach(() => {
		(
			sendEmail as jest.MockedFunction<typeof sendEmail>
		).mockClear();
	});

	describe("should return 400, if", () => {
		validationCases.forEach(
			({ testCaseName, body, query, error }) => {
				it(testCaseName, async () => {
					const res = await resetPasswordRequest(body, query);
					expect(res.status).toBe(400);
					expect(res.body.errors[0].message).toBe(error);
				});
			}
		);
	});

	describe("should return 401, if", () => {
		it("Reset token is not valid", async () => {
			const user = getUniqueUser("test1");
			await signupAndRequestForgotPassword(user);

			const res = await resetPasswordRequest(
				{
					password: "test123456",
					passwordConfirmation: "test123456",
				},
				{ resetToken: "invalid-token" }
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"توکن نامعتبر است یا منقضی شده است!"
			);
		});

		it("Reset token is expired", async () => {
			const user = getUniqueUser("test2");
			const resetToken = await signupAndRequestForgotPassword(
				user
			);
			const dbUser = await userRepository.findByEmail(
				user.email
			);
			dbUser!.passwordResetExpires = Date.now() - 1000;
			await dbUser!.save({ validateBeforeSave: false });

			const res = await resetPasswordRequest(
				{
					password: "test123456",
					passwordConfirmation: "test123456",
				},
				{ resetToken }
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"توکن نامعتبر است یا منقضی شده است!"
			);
		});

		it("Login with the old password is unsuccessful", async () => {
			const user = getUniqueUser("test4");
			const resetToken = await signupAndRequestForgotPassword(
				user
			);

			const newPassword = "newpassword123";
			await resetPasswordRequest(
				{
					password: newPassword,
					passwordConfirmation: newPassword,
				},
				{ resetToken }
			);

			const oldLoginRes = await loginRequest({
				email: user.email,
				password: user.password,
			});

			expect(oldLoginRes.status).toBe(401);
			expect(oldLoginRes.body.errors[0].message).toBe(
				"ایمیل یا رمز عبور اشتباه است!"
			);
		});
	});

	describe("should return 200, if", () => {
		it("Reset password is successful", async () => {
			const user = getUniqueUser("test3");
			const resetToken = await signupAndRequestForgotPassword(
				user
			);

			const newPassword = "newpassword123";
			const resetPasswordRes = await resetPasswordRequest(
				{
					password: newPassword,
					passwordConfirmation: newPassword,
				},
				{ resetToken }
			);

			expect(resetPasswordRes.status).toBe(200);
		});

		it("Login with the new password is successful", async () => {
			const user = getUniqueUser("test2");
			const resetToken = await signupAndRequestForgotPassword(
				user
			);

			const newPassword = "newpassword123";
			await resetPasswordRequest(
				{
					password: newPassword,
					passwordConfirmation: newPassword,
				},
				{ resetToken }
			);

			const loginRes = await loginRequest({
				email: user.email,
				password: newPassword,
			});

			expect(loginRes.status).toBe(200);
		});
	});
});
