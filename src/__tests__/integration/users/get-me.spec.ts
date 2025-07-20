import {
	getMeRequest,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";

describe("GET /api/users/get-me", () => {
	it("should return 200 if user is authenticated", async () => {
		const signupRes = await signupRequest({
			name: "test",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "password",
		});

		const res = await getMeRequest(
			signupRes.headers["set-cookie"]
		);
		expect(res.status).toBe(200);
	});
});
