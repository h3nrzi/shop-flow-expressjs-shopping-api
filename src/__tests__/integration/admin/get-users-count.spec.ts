import { getUsersCountByDayRequest } from "@/__tests__/helpers/admin.helper";
import {
	getInvalidToken,
	getUniqueUser,
	signupRequest,
} from "@/__tests__/helpers/auth.helper";
import { userRepository } from "@/core";

let user: ReturnType<typeof getUniqueUser>;
let userCookie: string;
let adminCookie: string;
let mainAdminCookie: string;

beforeEach(async () => {
	// Create a normal user
	user = getUniqueUser("user");
	const userRes = await signupRequest(user);
	userCookie = userRes.headers["set-cookie"][0];

	// Create an admin user
	const admin = getUniqueUser("admin");
	const adminRes = await signupRequest(admin);
	adminCookie = adminRes.headers["set-cookie"][0];
	const adminUser = await userRepository.findByEmail(
		admin.email
	);
	adminUser!.role = "admin";
	await adminUser!.save({ validateBeforeSave: false });

	// Create the main admin (admin@gmail.com)
	const mainAdmin = {
		name: "Main Admin",
		email: "admin@gmail.com",
		password: "test123456",
		passwordConfirmation: "test123456",
	};
	const mainAdminRes = await signupRequest(mainAdmin);
	mainAdminCookie = mainAdminRes.headers["set-cookie"][0];
	const mainAdminUser = await userRepository.findByEmail(
		mainAdmin.email
	);
	mainAdminUser!.role = "admin";
	await mainAdminUser!.save({ validateBeforeSave: false });
});

const validationCases = [
	{
		description: "If the period is invalid",
		params: { period: "invalid" },
		expectedMessage: "زمان وارد شده نامعتبر است",
	},
];

describe("GET /api/users/get-users-count", () => {
	describe("should return 401", () => {
		it("If no token is provided", async () => {
			const res = await getUsersCountByDayRequest("", "week");
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("If token is invalid", async () => {
			const res = await getUsersCountByDayRequest(
				"jwt=invalid-token",
				"week"
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
		});

		it("If user for token does not exist", async () => {
			const fakeToken = getInvalidToken();
			const res = await getUsersCountByDayRequest(
				`jwt=${fakeToken}`,
				"week"
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!"
			);
		});

		it("If user is inactive", async () => {
			const user = getUniqueUser("inactive");
			const signupRes = await signupRequest(user);
			const cookie = signupRes.headers["set-cookie"][0];
			const repoUser = await userRepository.findByEmail(
				user.email
			);
			repoUser!.active = false;
			await repoUser!.save({ validateBeforeSave: false });
			const res = await getUsersCountByDayRequest(
				cookie,
				"week"
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"کاربری که به این ایمیل مرتبط است غیرفعال شده!"
			);
		});

		// it("If user changed password after token was issued", async () => {
		// 	await updateMePasswordRequest(userCookie, {
		// 		passwordCurrent: "test123456",
		// 		password: "newpassword123",
		// 		passwordConfirmation: "newpassword123",
		// 	});

		// 	await new Promise(resolve => setTimeout(resolve, 500));

		// 	const res = await getUsersCountByDayRequest(
		// 		userCookie,
		// 		"week"
		// 	);

		// 	expect(res.status).toBe(401);
		// 	expect(res.body.errors[0].field).toBeNull();
		// 	expect(res.body.errors[0].message).toBe(
		// 		"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید."
		// 	);
		// });

		it("If user's role is not admin", async () => {
			const res = await getUsersCountByDayRequest(
				userCookie,
				"week"
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].field).toBeNull();
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("should return 400", () => {
		validationCases.forEach(
			({ description, params, expectedMessage }) => {
				it(description, async () => {
					const res = await getUsersCountByDayRequest(
						adminCookie,
						params.period
					);
					expect(res.status).toBe(400);
					expect(res.body.errors[0].message).toBe(
						expectedMessage
					);
				});
			}
		);
	});

	describe("should return 200", () => {
		it("For week", async () => {
			const res = await getUsersCountByDayRequest(
				adminCookie,
				"week"
			);
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data.usersCountByDay)).toBe(
				true
			);
		});

		it("For month", async () => {
			const res = await getUsersCountByDayRequest(
				adminCookie,
				"month"
			);
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data.usersCountByDay)).toBe(
				true
			);
		});

		it("For year", async () => {
			const res = await getUsersCountByDayRequest(
				adminCookie,
				"year"
			);
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data.usersCountByDay)).toBe(
				true
			);
		});

		it("For all", async () => {
			const res = await getUsersCountByDayRequest(
				adminCookie,
				"all"
			);
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data.usersCountByDay)).toBe(
				true
			);
		});

		it("For main admin", async () => {
			const res = await getUsersCountByDayRequest(
				mainAdminCookie,
				"week"
			);
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data.usersCountByDay)).toBe(
				true
			);
		});
	});
});
