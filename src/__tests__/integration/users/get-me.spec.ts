import {
	signupRequest,
	getUniqueUser,
} from "@/__tests__/helpers/auth.helper";
import { getMeRequest } from "@/__tests__/helpers/users.helper";

describe("GET /api/users/get-me", () => {
	it("should return 200 if user is authenticated", async () => {
		const user = getUniqueUser("user1");
		const signupRes = await signupRequest(user);
		const res = await getMeRequest(
			signupRes.headers["set-cookie"]
		);
		expect(res.status).toBe(200);
	});
});
