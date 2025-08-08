import { updateMePasswordRequest } from "@/__tests__/helpers/users.helper";
import {
	getInvalidToken,
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";

const validationCases = [
	{
		description: "should return 400 if passwordCurrent is not provided",
		body: {
			passwordCurrent: "",
			password: "newpassword",
			passwordConfirmation: "newpassword",
		},
		expectedError: "رمز عبور فعلی کاربر الزامی است",
	},
	{
		description: "should return 400 if password is not provided",
		body: {
			passwordCurrent: "password",
			password: "",
			passwordConfirmation: "newpassword",
		},
		expectedError: "رمز عبور کاربر الزامی است",
	},
	{
		description: "should return 400 if passwordConfirmation is not provided",
		body: {
			passwordCurrent: "password",
			password: "newpassword",
			passwordConfirmation: "",
		},
		expectedError: "تایید رمز عبور کاربر الزامی است",
	},
	{
		description:
			"should return 400 if password and passwordConfirmation are not the same",
		body: {
			passwordCurrent: "password",
			password: "newpassword",
			passwordConfirmation: "newpassword2",
		},
		expectedError: "رمز عبور و تایید رمز عبور باید یکسان باشد",
	},
];

let token: string;
let user: {
	email: string;
	password: string;
	name: string;
	passwordConfirmation: string;
};

beforeEach(async () => {
	user = getUniqueUser("user1");
	const signupRes = await signupRequest(user);
	token = signupRes.headers["set-cookie"][0];
});

describe("PUT /api/users/update-me-password", () => {
	describe("should return 401, if", () => {
		it("No token is provided", async () => {
			const res = await updateMePasswordRequest("", {
				passwordCurrent: "password",
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("Token is invalid", async () => {
			const res = await updateMePasswordRequest("jwt=invalid-token", {
				passwordCurrent: "password",
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("User for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const res = await updateMePasswordRequest(`jwt=${fakeToken}`, {
				passwordCurrent: "password",
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!",
			);
		});

		it("User is inactive", async () => {
			const user = getUniqueUser("inactive");
			const signupRes = await signupRequest(user);
			const cookie = signupRes.headers["set-cookie"][0];
			const repoUser = await userRepository.findByEmail(user.email);
			repoUser!.active = false;
			await repoUser!.save({ validateBeforeSave: false });
			const res = await updateMePasswordRequest(cookie, {
				passwordCurrent: "password",
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربری که به این ایمیل مرتبط است غیرفعال شده!",
			);
		});

		// it("If user changed password after token was issued", async () => {
		// 	await updateMePasswordRequest(token, {
		// 		passwordCurrent: "test123456",
		// 		password: "newpassword123",
		// 		passwordConfirmation: "newpassword123",
		// 	});

		// 	await new Promise(resolve => setTimeout(resolve, 3000));

		// 	const res = await updateMePasswordRequest(token, {
		// 		passwordCurrent: "test123456",
		// 		password: "newpassword123",
		// 		passwordConfirmation: "newpassword123",
		// 	});

		// 	expect(res.status).toBe(401);
		// 	expect(res.body.errors[0].field).toBeNull();
		// 	expect(res.body.errors[0].message).toBe(
		// 		"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید."
		// 	);
		// });
	});

	describe("should return 400, if", () => {
		validationCases.forEach(({ description, body, expectedError }) => {
			it(description, async () => {
				const res = await updateMePasswordRequest(token, body);
				expect(res.status).toBe(400);
				expect(res.body.errors).toBeDefined();
				expect(res.body.errors[0].message).toBe(expectedError);
			});
		});
	});

	describe("should return 403, if", () => {
		it("PasswordCurrent is incorrect", async () => {
			const res = await updateMePasswordRequest(token, {
				passwordCurrent: "incorrectpassword",
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(403);
			expect(res.body.errors).toBeDefined();
			expect(res.body.errors[0].message).toBe("رمز عبور فعلی شما اشتباه است");
		});
	});

	describe("should return 200, if", () => {
		it("Password is updated successfully", async () => {
			const res = await updateMePasswordRequest(token, {
				passwordCurrent: user.password,
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(200);
		});
	});
});
