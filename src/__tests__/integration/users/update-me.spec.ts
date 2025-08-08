import {
	signupRequest,
	getUniqueUser,
	getInvalidToken,
} from "@/__tests__/helpers/auth.helper";
import {
	updateMePasswordRequest,
	updateMeRequest,
} from "@/__tests__/helpers/users.helper";
import { userRepository } from "@/core";

let token: string;
let user: {
	email: string;
	name: string;
	password: string;
	passwordConfirmation: string;
};

const validationCases = [
	{
		description:
			"should return 400 if only email is provided but it is invalid",
		body: {
			email: "john.doe",
		},
		expectedError: "فرمت ایمیل کاربر معتبر نیست",
	},
	{
		description: "should return 400 if only name is provided but it is invalid",
		body: {
			name: "",
		},
		expectedError: "نام کاربر الزامی است",
	},
];

beforeEach(async () => {
	user = getUniqueUser("user1");
	const signupRes = await signupRequest(user);

	token = signupRes.headers["set-cookie"][0];
});

describe("PUT /api/users/update-me", () => {
	describe("should return 401, if", () => {
		it("No token is provided", async () => {
			const res = await updateMeRequest("", {
				email: "newemail@test.com",
				photo: "https://pic.com",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("Token is invalid", async () => {
			const res = await updateMeRequest("jwt=invalid-token", {
				email: "newemail@test.com",
				photo: "https://pic.com",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("User for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const res = await updateMeRequest(`jwt=${fakeToken}`, {
				email: "newemail@test.com",
				photo: "https://pic.com",
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
				const res = await updateMeRequest(token, body);
				expect(res.status).toBe(400);
				expect(res.body.errors).toBeDefined();
				expect(res.body.errors[0].message).toBe(expectedError);
			});
		});
	});

	describe("should return 422, if", () => {
		it("Password and passwordConfirmation are provided", async () => {
			const res = await updateMeRequest(token, {
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(422);
			expect(res.body.errors[0].message).toBe(
				"با این درخواست نمی توانید رمز عبور را آپدیت کنید",
			);
		});
	});

	describe("should return 200, if", () => {
		it("Name, email and photo are updated successfully", async () => {
			const res = await updateMeRequest(token, {
				email: "newemail@test.com",
				photo: "https://pic.com",
			});
			expect(res.status).toBe(200);
			expect(res.body.data.updatedUser.email).toBe("newemail@test.com");
			expect(res.body.data.updatedUser.photo).toBe("https://pic.com");
		});
	});
});
