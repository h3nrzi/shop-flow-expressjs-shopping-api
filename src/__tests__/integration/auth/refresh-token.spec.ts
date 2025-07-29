import {
	getUniqueUser,
	loginRequest,
	refreshTokenRequest,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";

describe("POST /api/users/refresh-token", () => {
	describe("should return 401, if", () => {
		it("No refresh token provided", async () => {
			const res = await refreshTokenRequest();
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"توکن تازه‌سازی ارائه نشده است"
			);
		});

		it("Invalid refresh token", async () => {
			const res = await refreshTokenRequest(
				"refreshToken=invalid-token"
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"توکن تازه‌سازی معتبر نیست"
			);
		});

		it("User is inactive", async () => {
			const user = getUniqueUser("refresh");
			await signupRequest(user);
			const loginRes = await loginRequest(user);

			// Deactivate user
			const userDoc = await userRepository.findByEmail(
				user.email
			);
			userDoc!.active = false;
			await userDoc!.save({ validateBeforeSave: false });

			const refreshCookie = loginRes.headers["set-cookie"][1];

			const res = await refreshTokenRequest(refreshCookie);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"حساب کاربری غیرفعال است"
			);
		});

		it("Refresh token expired", async () => {
			const user = getUniqueUser("expired");
			await signupRequest(user);
			const loginRes = await loginRequest(user);

			// Expire refresh token
			const userDoc = await userRepository.findByEmail(
				user.email
			);
			userDoc!.refreshTokenExpires = new Date(Date.now() - 1000);
			await userDoc!.save({ validateBeforeSave: false });

			const refreshCookie = loginRes.headers["set-cookie"][1];

			const res = await refreshTokenRequest(refreshCookie);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"توکن تازه‌سازی نامعتبر یا منقضی شده است"
			);
		});
	});

	describe("should return 200, if", () => {
		it("Valid refresh token provided", async () => {
			const user = getUniqueUser("valid");
			await signupRequest(user);
			const loginRes = await loginRequest(user);

			const refreshCookie = loginRes.headers["set-cookie"][1];

			const res = await refreshTokenRequest(refreshCookie);
			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.user).toBeDefined();
			expect(res.headers["set-cookie"]).toBeDefined();
			expect(res.headers["x-auth-token"]).toBeDefined();
		});
	});
});