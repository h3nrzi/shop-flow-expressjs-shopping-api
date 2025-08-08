import {
	forgotPasswordRequest,
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";
import { sendEmail } from "@/utils/email";

const validationCases = [
	{
		testCaseName: "Email is not provided",
		body: { email: "" },
		error: "ایمیل کاربر الزامی است",
	},
	{
		testCaseName: "Email is not valid",
		body: { email: "user@test" },
		error: "فرمت ایمیل وارد شده معتبر نیست",
	},
];

describe("POST /api/users/forgot-password", () => {
	describe("should return 400, if", () => {
		validationCases.forEach(({ testCaseName, body, error }) => {
			it(testCaseName, async () => {
				const res = await forgotPasswordRequest(body);
				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBe(error);
			});
		});
	});

	describe("should return 404, if", () => {
		it("User is not found", async () => {
			const res = await forgotPasswordRequest({
				email: "test@test.com",
			});
			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe(
				"هیچ کاربری با این آدرس ایمیل وجود ندارد.",
			);
		});
	});

	describe("should return 401, if", () => {
		it("User is not active", async () => {
			const user = getUniqueUser("user");
			await signupRequest(user);
			const userDoc = await userRepository.findByEmail(user.email);
			userDoc!.active = false;
			await userDoc!.save({ validateBeforeSave: false });
			const res = await forgotPasswordRequest({
				email: user.email,
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربری که به این ایمیل مرتبط است مسدود شده است!",
			);
		});
	});

	describe("should return 200, if", () => {
		it("User is found and active and email is valid", async () => {
			const user = getUniqueUser("user");
			await signupRequest(user);
			const res = await forgotPasswordRequest({
				email: user.email,
			});

			// check if the response is 200
			expect(res.status).toBe(200);
			expect(res.body.message).toBe(
				"ایمیل بازیابی رمز عبور با موفقیت ارسال شد",
			);

			// check if sendEmail was called with the correct arguments
			expect(sendEmail).toHaveBeenCalledWith(
				user.email,
				expect.any(String),
				"درخواست برای ریست کردن رمز عبور",
			);

			// check if the user has a passwordResetToken and passwordResetExpires
			const userDoc = await userRepository.findByEmail(user.email);
			expect(userDoc!.passwordResetToken).toBeDefined();
			expect(userDoc!.passwordResetExpires).toBeDefined();
		});
	});
});
