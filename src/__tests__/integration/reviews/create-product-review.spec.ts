import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createReviewRequest,
	createTestProduct,
	createTestUserAndGetCookie,
	getInvalidId,
	getInvalidObjectId,
	getInvalidReviewData,
	getValidReviewData,
} from "@/__tests__/helpers/reviews.helper";

describe("POST /api/products/:productId/reviews", () => {
	let product: any;
	let cookie: string;

	beforeEach(async () => {
		product = await createTestProduct();
		const testUser = await createTestUserAndGetCookie("reviewer");
		cookie = testUser.cookie;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const reviewData = getValidReviewData();
			const res = await createReviewRequest(product.id, reviewData);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const reviewData = getValidReviewData();
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await createReviewRequest(
				product.id,
				reviewData,
				invalidCookie,
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!",
			);
		});
	});

	describe("should return 400, if", () => {
		it("product ID is not a valid ObjectId", async () => {
			const reviewData = getValidReviewData();
			const res = await createReviewRequest(getInvalidId(), reviewData, cookie);

			expect(res.status).toBe(400);
		});

		const invalidDataCases = getInvalidReviewData();
		invalidDataCases.forEach(({ testCase, data, expectedError }) => {
			it(testCase, async () => {
				const res = await createReviewRequest(product.id, data, cookie);

				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBe(expectedError);
			});
		});
	});

	describe("should return 404, if", () => {
		it("product does not exist", async () => {
			const reviewData = getValidReviewData();
			const nonExistentProductId = getInvalidObjectId();
			const res = await createReviewRequest(
				nonExistentProductId,
				reviewData,
				cookie,
			);

			expect(res.status).toBe(404);
		});
	});

	describe("should return 201, if", () => {
		it("review is created successfully with valid data", async () => {
			const reviewData = getValidReviewData(4, "Great product!");
			const res = await createReviewRequest(product.id, reviewData, cookie);

			expect(res.status).toBe(201);
		});
	});
});
