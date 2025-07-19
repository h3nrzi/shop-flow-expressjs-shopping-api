import { signup } from "@/tests/helpers/auth-requests";
import { getMe } from "@/tests/helpers/user-requests";

let johnToken: string;

beforeEach(async () => {
	const signupRes = await signup({
		name: "John",
		email: "john@test.com",
		password: "password",
		passwordConfirmation: "password",
	});

	johnToken = signupRes.headers["set-cookie"][0];
});

describe("GET /api/users/get-me", () => {
	describe("Success", () => {
		it("should return 200 if user is authenticated", async () => {
			const res = await getMe(johnToken);
			expect(res.status).toBe(200);
			expect(res.body.data.currentUser.name).toBe("John");
			expect(res.body.data.currentUser.email).toBe("john@test.com");
		});
	});
});
