import { getMe, signup } from "@/tests/helpers/auth.requests";

describe("GET /api/users/get-me", () => {
	it("should return 200 if user is authenticated", async () => {
		const signupRes = await signup({
			name: "test",
			email: "test@test.com",
			password: "password",
			passwordConfirmation: "password",
		});

		const res = await getMe(signupRes.headers["set-cookie"]);
		expect(res.status).toBe(200);
	});
});
