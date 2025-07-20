import {
	logoutRequest,
	signupRequest,
	getUniqueUser,
} from "@/__tests__/helpers/auth.helper";

describe("POST /api/users/logout", () => {
	describe("success", () => {
		it("should return 204 and remove the cookie if logout is successful", async () => {
			const user = getUniqueUser("user");
			const signupResponse = await signupRequest(user);
			const logoutResponse = await logoutRequest(
				signupResponse.headers["set-cookie"]
			);
			expect(logoutResponse.status).toBe(204);
			const cookie = logoutResponse.headers["set-cookie"];
			const result = cookie?.[0].split(";")[0];
			expect(result).toBe("jwt=");
		});
	});
});
