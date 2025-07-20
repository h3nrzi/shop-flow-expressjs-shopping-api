import { updateMePasswordRequest } from "@/__tests__/helpers/users.helper";
import {
	signupRequest,
	validUser,
} from "@/__tests__/helpers/auth.helper";

const validationCases = [
	{
		description:
			"should return 400 if passwordCurrent is not provided",
		body: {
			passwordCurrent: "",
			password: "newpassword",
			passwordConfirmation: "newpassword",
		},
	},
	{
		description: "should return 400 if password is not provided",
		body: {
			passwordCurrent: "password",
			password: "",
			passwordConfirmation: "newpassword",
		},
	},
	{
		description:
			"should return 400 if passwordConfirmation is not provided",
		body: {
			passwordCurrent: "password",
			password: "newpassword",
			passwordConfirmation: "",
		},
	},
	{
		description:
			"should return 400 if password and passwordConfirmation are not the same",
		body: {
			passwordCurrent: "password",
			password: "newpassword",
			passwordConfirmation: "newpassword2",
		},
	},
];

let token: string;

beforeEach(async () => {
	const signupRes = await signupRequest(validUser);

	token = signupRes.headers["set-cookie"][0];
});

describe("PUT /api/users/update-me-password", () => {
	describe("Authorization", () => {
		it("should return 401 if user is not authenticated", async () => {
			const res = await updateMePasswordRequest(
				"invalid-token",
				{
					passwordCurrent: "password",
					password: "newpassword",
					passwordConfirmation: "newpassword",
				}
			);
			expect(res.status).toBe(401);
		});
	});

	describe("Validation", () => {
		validationCases.forEach(({ description, body }) => {
			it(description, async () => {
				const res = await updateMePasswordRequest(token, body);
				expect(res.status).toBe(400);
				expect(res.body.errors).toBeDefined();
			});
		});
	});

	describe("Business Logics", () => {
		it("should return 401 if passwordCurrent is incorrect", async () => {
			const res = await updateMePasswordRequest(token, {
				passwordCurrent: "incorrectpassword",
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(401);
			expect(res.body.errors).toBeDefined();
		});
	});

	describe("Success", () => {
		it("should return 200 if password is updated", async () => {
			const res = await updateMePasswordRequest(token, {
				passwordCurrent: "password",
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(200);
			expect(res.body.data).toBeDefined();
		});
	});
});
