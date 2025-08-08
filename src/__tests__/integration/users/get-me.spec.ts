import {
	getInvalidToken,
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { getMeRequest } from "@/__tests__/helpers/users.helper";
import { userRepository } from "@/core";

let token: string;

beforeEach(async () => {
	const user = getUniqueUser("user1");
	const signupRes = await signupRequest(user);
	token = signupRes.headers["set-cookie"][0];
});

describe("GET /api/users/get-me", () => {
	describe("should return 401, if", () => {
		it("If no token is provided", async () => {
			const res = await getMeRequest("");
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("If token is invalid", async () => {
			const res = await getMeRequest("jwt=invalid-token");
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("If user for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const res = await getMeRequest(`jwt=${fakeToken}`);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!",
			);
		});

		it("If user is inactive", async () => {
			const user = getUniqueUser("inactive");
			const signupRes = await signupRequest(user);
			const cookie = signupRes.headers["set-cookie"][0];
			const repoUser = await userRepository.findByEmail(user.email);
			repoUser!.active = false;
			await repoUser!.save({ validateBeforeSave: false });
			const res = await getMeRequest(cookie);
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

		// 	await new Promise(resolve => setTimeout(resolve, 1000));

		// 	const res = await getMeRequest(token);

		// 	expect(res.status).toBe(401);
		// 	expect(res.body.errors[0].field).toBeNull();
		// 	expect(res.body.errors[0].message).toBe(
		// 		"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید."
		// 	);
		// });
	});

	describe("should return 200, if", () => {
		it("User is authenticated", async () => {
			const res = await getMeRequest(token);
			expect(res.status).toBe(200);
		});
	});
});
