import { signupRequest } from "@/tests/helpers/auth.helper";
import { updateMeRequest } from "@/tests/helpers/users.helper";

let token: string;

const validationCases = [
	{
		description: "should return 400 if name is not provided",
		body: { name: null, email: "john.doe@test.com" },
	},
	{
		description: "should return 400 if email is not provided",
		body: { name: "John Doe", email: null },
	},
	{
		description: "should return 400 if email is not valid",
		body: { name: "John Doe", email: "john.doe" },
	},
];

beforeEach(async () => {
	const signupRes = await signupRequest({
		name: "John",
		email: "john@test.com",
		password: "password",
		passwordConfirmation: "password",
	});

	token = signupRes.headers["set-cookie"][0];
});

describe("PUT /api/users/update-me", () => {
	describe("Authorization", () => {
		it("should return 401 if user is not authenticated", async () => {
			const res = await updateMeRequest("invalid-token", {
				name: "John Doe",
				email: "john.doe@test.com",
			});
			expect(res.status).toBe(401);
		});
	});

	describe("Validation", () => {
		validationCases.forEach(testCase => {
			it(testCase.description, async () => {
				const res = await updateMeRequest(token, testCase.body);
				expect(res.status).toBe(400);
			});
		});
	});

	describe("Success", () => {
		it("should update the user's name and email", async () => {
			const res = await updateMeRequest(token, {
				name: "John Doe",
				email: "john.doe@test.com",
				photo: "https://pic.com",
			});
			expect(res.status).toBe(200);
			expect(res.body.data.updatedUser.name).toBe("John Doe");
			expect(res.body.data.updatedUser.email).toBe(
				"john.doe@test.com"
			);
			expect(res.body.data.updatedUser.photo).toBe(
				"https://pic.com"
			);
		});
	});
});
