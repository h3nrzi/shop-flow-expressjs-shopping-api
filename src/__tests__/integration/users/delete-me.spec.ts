import {
	loginRequest,
	signupRequest,
	getUniqueUser,
} from "@/__tests__/helpers/auth.helper";
import { deleteMeRequest } from "@/__tests__/helpers/users.helper";

let token: string;

beforeEach(async () => {
	const user = getUniqueUser("user1");
	const signupRes = await signupRequest(user);
	token = signupRes.headers["set-cookie"][0];
});

describe("DELETE /api/users/delete-me", () => {
	describe("Authorization", () => {
		it("should return 401 if user is not authenticated", async () => {
			const res = await deleteMeRequest("invalid-token");
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("should return 401 if the token is provided belongs to user that is not exist", async () => {
			await deleteMeRequest(token);
			const res = await deleteMeRequest(token);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!"
			);
		});
	});

	describe("Success", () => {
		it("should delete the user", async () => {
			const res = await deleteMeRequest(token);
			expect(res.status).toBe(204);
			expect(res.body).toEqual({});
		});

		it("should not login after deleting the user", async () => {
			const user = getUniqueUser("user2");
			await deleteMeRequest(token);
			const res = await loginRequest({
				email: user.email,
				password: user.password,
			});
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"ایمیل یا رمز عبور اشتباه است!"
			);
		});
	});
});
