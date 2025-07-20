import { updateMePasswordRequest } from "@/__tests__/helpers/users.helper";
import {
	signupRequest,
	getUniqueUser,
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
		expectedError: "رمز عبور فعلی کاربر الزامی است",
	},
	{
		description: "should return 400 if password is not provided",
		body: {
			passwordCurrent: "password",
			password: "",
			passwordConfirmation: "newpassword",
		},
		expectedError: "رمز عبور کاربر الزامی است",
	},
	{
		description:
			"should return 400 if passwordConfirmation is not provided",
		body: {
			passwordCurrent: "password",
			password: "newpassword",
			passwordConfirmation: "",
		},
		expectedError: "تایید رمز عبور کاربر الزامی است",
	},
	{
		description:
			"should return 400 if password and passwordConfirmation are not the same",
		body: {
			passwordCurrent: "password",
			password: "newpassword",
			passwordConfirmation: "newpassword2",
		},
		expectedError: "رمز عبور و تایید رمز عبور باید یکسان باشد",
	},
];

let token: string;
let user: {
	email: string;
	password: string;
	name: string;
	passwordConfirmation: string;
};

beforeEach(async () => {
	user = getUniqueUser("user1");
	const signupRes = await signupRequest(user);
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
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});
	});

	describe("Validation", () => {
		validationCases.forEach(
			({ description, body, expectedError }) => {
				it(description, async () => {
					const res = await updateMePasswordRequest(token, body);
					expect(res.status).toBe(400);
					expect(res.body.errors).toBeDefined();
					expect(res.body.errors[0].message).toBe(expectedError);
				});
			}
		);
	});

	describe("Business Logics", () => {
		it("should return 403 if passwordCurrent is incorrect", async () => {
			const res = await updateMePasswordRequest(token, {
				passwordCurrent: "incorrectpassword",
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(403);
			expect(res.body.errors).toBeDefined();
			expect(res.body.errors[0].message).toBe(
				"رمز عبور فعلی شما اشتباه است"
			);
		});
	});

	describe("Success", () => {
		it("should return 200 if password is updated", async () => {
			const res = await updateMePasswordRequest(token, {
				passwordCurrent: user.password,
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(200);
		});
	});
});
