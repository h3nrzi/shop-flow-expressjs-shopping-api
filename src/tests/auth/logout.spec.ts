import { logout, signup } from "../helpers/auth-requests";

describe("POST /api/users/logout", () => {
	describe("success", () => {
		it("should return 204 and remove the cookie if logout is successful", async () => {
			const signupResponse = await signup({
				name: "test",
				email: "test@test.com",
				password: "password",
				passwordConfirmation: "password",
			});
			const logoutResponse = await logout(
				signupResponse.headers["set-cookie"],
			);
			expect(logoutResponse.status).toBe(204);
			const cookie = logoutResponse.headers["set-cookie"];
			const result = cookie?.[0].split(";")[0];
			expect(result).toBe("jwt=");
		});
	});
});
