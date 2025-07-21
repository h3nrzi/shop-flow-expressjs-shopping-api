import { getUsersCountByDayRequest } from "@/__tests__/helpers/admin.helper";
import {
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
		description: "should return 400 if the period is invalid",
		params: { period: "invalid" },
		expectedMessage: "زمان وارد شده نامعتبر است",
	},
];

describe("GET /api/users/get-users-count", () => {
	describe("Authorization", () => {
		it("should return 401 if no token is provided", async () => {
			const res = await getUsersCountByDayRequest("", "week");
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("should return 401 if the user is not an admin", async () => {
			const res = await getUsersCountByDayRequest(
				userCookie,
				"week"
			);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما اجازه انجام این عمل را ندارید!"
			);
		});
	});

	describe("Validation", () => {
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

	describe("Success", () => {
		it("should return 200 and users count for week", async () => {
			const res = await getUsersCountByDayRequest(
				adminCookie,
				"week"
			);
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data.usersCountByDay)).toBe(
				true
			);
		});

		it("should return 200 and users count for month", async () => {
			const res = await getUsersCountByDayRequest(
				adminCookie,
				"month"
			);
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data.usersCountByDay)).toBe(
				true
			);
		});

		it("should return 200 and users count for year", async () => {
			const res = await getUsersCountByDayRequest(
				adminCookie,
				"year"
			);
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data.usersCountByDay)).toBe(
				true
			);
		});

		it("should return 200 and users count for all", async () => {
			const res = await getUsersCountByDayRequest(
				adminCookie,
				"all"
			);
			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data.usersCountByDay)).toBe(
				true
			);
		});

		it("should return 200 and users count for main admin", async () => {
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
