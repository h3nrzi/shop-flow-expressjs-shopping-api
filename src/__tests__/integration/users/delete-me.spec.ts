import {
	loginRequest,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { deleteMeRequest } from "@/__tests__/helpers/users.helper";
import { validUser } from "@/__tests__/helpers/auth.helper";

let token: string;

beforeEach(async () => {
	const signupRes = await signupRequest(validUser);
	token = signupRes.headers["set-cookie"][0];
});

describe("DELETE /api/users/delete-me", () => {
	describe("Authorization", () => {
		it("should return 401 if user is not authenticated", async () => {
			const res = await deleteMeRequest("invalid-token");
			expect(res.status).toBe(401);
		});

		it("should return 401 if the token is provided belongs to user that is not exist", async () => {
			await deleteMeRequest(token);
			const res = await deleteMeRequest(token);
			expect(res.status).toBe(401);
			expect(res.body.errors).toBeDefined();
		});
	});

	describe("Success", () => {
		it("should delete the user", async () => {
			const res = await deleteMeRequest(token);
			expect(res.status).toBe(204);
		});

		it("should not login after deleting the user", async () => {
			await deleteMeRequest(token);
			const res = await loginRequest({
				email: validUser.email,
				password: validUser.password,
			});
			expect(res.status).toBe(401);
		});
	});
});
