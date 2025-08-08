import {
	getInvalidToken,
	getUniqueUser,
	loginRequest,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { deleteMeRequest } from "@/__tests__/helpers/users.helper";
import { userRepository } from "@/core";

let token: string;

beforeEach(async () => {
	const user = getUniqueUser("user1");
	const signupRes = await signupRequest(user);
	token = signupRes.headers["set-cookie"][0];
});

describe("DELETE /api/users/delete-me", () => {
	describe("should return 401, if", () => {
		it("If no token is provided", async () => {
			const res = await deleteMeRequest("");
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("If token is invalid", async () => {
			const res = await deleteMeRequest("jwt=invalid-token");
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("If user for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const res = await deleteMeRequest(`jwt=${fakeToken}`);
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
			const res = await deleteMeRequest(cookie);
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

		// 	const res = await deleteMeRequest(token);

		// 	expect(res.status).toBe(401);
		// 	expect(res.body.errors[0].field).toBeNull();
		// 	expect(res.body.errors[0].message).toBe(
		// 		"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید."
		// 	);
		// });
	});

	describe("should return 204, if", () => {
		it("User is deleted successfully", async () => {
			const res = await deleteMeRequest(token);
			expect(res.status).toBe(204);
			expect(res.body).toEqual({});
		});

		it("User cannot login after being deleted", async () => {
			const user = getUniqueUser("user2");
			await deleteMeRequest(token);
			const res = await loginRequest({
				email: user.email,
				password: user.password,
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("ایمیل یا رمز عبور اشتباه است!");
		});
	});
});
