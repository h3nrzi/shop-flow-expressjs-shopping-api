import {
	signupRequest,
	validUser,
} from "@/__tests__/helpers/auth.helper";
import { updateMeRequest } from "@/__tests__/helpers/users.helper";

let token: string;

const validationCases = [
	{
		description:
			"should return 400 if only email is provided but it is invalid",
		body: {
			email: "john.doe",
		},
	},
	{
		description:
			"should return 400 if only name is provided but it is invalid",
		body: {
			name: "",
		},
	},
];

beforeEach(async () => {
	const signupRes = await signupRequest(validUser);

	token = signupRes.headers["set-cookie"][0];
});

describe("PUT /api/users/update-me", () => {
	describe("Authorization", () => {
		it("should return 401 if user is not authenticated", async () => {
			const res = await updateMeRequest("invalid-token", {
				name: validUser.name,
				email: validUser.email,
				photo: "https://pic.com",
			});
			expect(res.status).toBe(401);
		});
	});

	describe("Validation", () => {
		validationCases.forEach(testCase => {
			it(testCase.description, async () => {
				const res = await updateMeRequest(token, testCase.body);
				expect(res.status).toBe(400);
				expect(res.body.errors).toBeDefined();
			});
		});
	});

	describe("Business Logics", () => {
		it("should return 400 if password and passwordConfirmation are provided", async () => {
			const res = await updateMeRequest(token, {
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(400);
			expect(res.body.errors).toBeDefined();
		});
	});

	describe("Success", () => {
		it("should update the user's name, email and photo", async () => {
			const res = await updateMeRequest(token, {
				email: "newemail@test.com",
				photo: "https://pic.com",
			});
			expect(res.status).toBe(200);
			expect(res.body.data.updatedUser.email).toBe(
				"newemail@test.com"
			);
			expect(res.body.data.updatedUser.photo).toBe(
				"https://pic.com"
			);
		});
	});
});
