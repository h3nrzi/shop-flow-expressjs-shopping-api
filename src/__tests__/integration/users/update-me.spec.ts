import {
	signupRequest,
	getUniqueUser,
} from "@/__tests__/helpers/auth.helper";
import { updateMeRequest } from "@/__tests__/helpers/users.helper";

let token: string;
let user: {
	email: string;
	name: string;
	password: string;
	passwordConfirmation: string;
};

const validationCases = [
	{
		description:
			"should return 400 if only email is provided but it is invalid",
		body: {
			email: "john.doe",
		},
		expectedError: "فرمت ایمیل کاربر معتبر نیست",
	},
	{
		description:
			"should return 400 if only name is provided but it is invalid",
		body: {
			name: "",
		},
		expectedError: "نام کاربر الزامی است",
	},
];

beforeEach(async () => {
	user = getUniqueUser("user1");
	const signupRes = await signupRequest(user);

	token = signupRes.headers["set-cookie"][0];
});

describe("PUT /api/users/update-me", () => {
	describe("Authorization", () => {
		it("should return 401 if user is not authenticated", async () => {
			const res = await updateMeRequest("invalid-token", {
				name: "new name",
				email: "newemail@test.com",
				photo: "https://pic.com",
			});
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
					const res = await updateMeRequest(token, body);
					expect(res.status).toBe(400);
					expect(res.body.errors).toBeDefined();
					expect(res.body.errors[0].message).toBe(expectedError);
				});
			}
		);
	});

	describe("Business Logics", () => {
		it("should return 400 if password and passwordConfirmation are provided", async () => {
			const res = await updateMeRequest(token, {
				password: "newpassword",
				passwordConfirmation: "newpassword",
			});
			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"با این درخواست نمی توانید رمز عبور را آپدیت کنید"
			);
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
