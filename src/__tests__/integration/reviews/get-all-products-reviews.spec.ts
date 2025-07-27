import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createMultipleTestReviews,
	createTestProduct,
	createTestReview,
	createTestUserAndGetCookie,
	expectValidPaginationResponse,
	expectValidReviewResponse,
	getAllReviewsRequest,
	getInvalidId,
	getInvalidObjectId,
} from "@/__tests__/helpers/reviews.helper";

describe("GET /api/products/:productId/reviews", () => {
	let product: any;
	let user: any;
	let cookie: string;

	beforeEach(async () => {
		product = await createTestProduct();
		const testUser = await createTestUserAndGetCookie(
			"reviewer"
		);
		user = testUser.user;
		cookie = testUser.cookie;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString()
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{},
				invalidCookie
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!"
			);
		});
	});

	describe("should return 400, if", () => {
		it("product ID is not a valid ObjectId", async () => {
			const res = await getAllReviewsRequest(
				getInvalidId(),
				{},
				cookie
			);

			expect(res.status).toBe(400);
		});
	});

	describe("should return 404, if", () => {
		it("product does not exist", async () => {
			const nonExistentProductId = getInvalidObjectId();
			const res = await getAllReviewsRequest(
				nonExistentProductId,
				{},
				cookie
			);

			expect(res.status).toBe(404);
		});

		it("page number exceeds total pages", async () => {
			// Create only 2 reviews
			await createMultipleTestReviews(product._id.toString(), 2);

			// Request page 10 (which doesn't exist)
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ page: 10, limit: 5 },
				cookie
			);

			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe(
				"این صفحه وجود ندارد"
			);
		});
	});

	describe("should return 200, if", () => {
		it("returns empty array when product has no reviews", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{},
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.results).toBe(0);
			expect(res.body.data.reviews).toEqual([]);
			expectValidPaginationResponse(res.body.pagination);
		});

		it("returns all reviews for a product", async () => {
			// Create 3 reviews for the product
			await createMultipleTestReviews(product._id.toString(), 3);

			const res = await getAllReviewsRequest(
				product._id.toString(),
				{},
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.results).toBe(3);
			expect(res.body.data.reviews).toHaveLength(3);
			expectValidPaginationResponse(res.body.pagination);

			// Verify each review structure
			res.body.data.reviews.forEach((review: any) => {
				expectValidReviewResponse(review);
				expect(review.product._id).toBe(product._id.toString());
			});
		});

		it("returns reviews with populated user and product data", async () => {
			await createTestReview(
				product._id.toString(),
				user._id.toString()
			);

			const res = await getAllReviewsRequest(
				product._id.toString(),
				{},
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.reviews).toHaveLength(1);

			const review = res.body.data.reviews[0];

			// Check user population
			expect(review.user).toHaveProperty("_id");
			expect(review.user).toHaveProperty("name");
			expect(review.user).toHaveProperty("email");

			// Check product population
			expect(review.product).toHaveProperty("_id");
			expect(review.product).toHaveProperty("name");
			expect(review.product).toHaveProperty("price");
		});
	});

	describe("pagination", () => {
		beforeEach(async () => {
			// Create 10 reviews for pagination testing
			await createMultipleTestReviews(
				product._id.toString(),
				10
			);
		});

		it("returns first page with default limit", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{},
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBeLessThanOrEqual(10);
			expect(res.body.pagination.page).toBe(1);
			expect(res.body.pagination.totalResults).toBe(10);
		});

		it("returns specific page with custom limit", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ page: 2, limit: 3 },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(3);
			expect(res.body.pagination.page).toBe(2);
			expect(res.body.pagination.limit).toBe(3);
			expect(res.body.pagination.totalResults).toBe(10);
			expect(res.body.pagination.totalPages).toBe(4); // Math.ceil(10/3)
		});

		it("returns last page correctly", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ page: 4, limit: 3 },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(1); // Only 1 review on last page (10 % 3 = 1)
			expect(res.body.pagination.page).toBe(4);
			expect(res.body.pagination.hasNextPage).toBe(false);
			expect(res.body.pagination.hasPrevPage).toBe(true);
		});

		it("handles large limit values", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ limit: 100 },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(10); // All available reviews
			expect(res.body.pagination.totalPages).toBe(1);
		});
	});

	describe("query parameters", () => {
		beforeEach(async () => {
			// Create reviews with different ratings for filtering tests
			await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{
					rating: 5,
					comment: "Excellent product",
				}
			);

			const { user: user2 } = await createTestUserAndGetCookie(
				"reviewer2"
			);
			await createTestReview(
				product._id.toString(),
				user2._id.toString(),
				{
					rating: 3,
					comment: "Average product",
				}
			);

			const { user: user3 } = await createTestUserAndGetCookie(
				"reviewer3"
			);
			await createTestReview(
				product._id.toString(),
				user3._id.toString(),
				{
					rating: 1,
					comment: "Poor product",
				}
			);
		});

		it("filters reviews by rating", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ rating: 5 },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(1);
			expect(res.body.data.reviews[0].rating).toBe(5);
		});

		it("filters reviews by rating range", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ "rating[gte]": 3 },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(2); // ratings 3 and 5
			res.body.data.reviews.forEach((review: any) => {
				expect(review.rating).toBeGreaterThanOrEqual(3);
			});
		});

		it("sorts reviews by rating descending", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ sort: "-rating" },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(3);

			const ratings = res.body.data.reviews.map(
				(review: any) => review.rating
			);
			expect(ratings).toEqual([5, 3, 1]); // Descending order
		});

		it("sorts reviews by rating ascending", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ sort: "rating" },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(3);

			const ratings = res.body.data.reviews.map(
				(review: any) => review.rating
			);
			expect(ratings).toEqual([1, 3, 5]); // Ascending order
		});

		it("sorts reviews by creation date", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ sort: "-createdAt" },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(3);

			// Verify dates are in descending order
			const dates = res.body.data.reviews.map(
				(review: any) => new Date(review.createdAt)
			);
			for (let i = 0; i < dates.length - 1; i++) {
				expect(dates[i].getTime()).toBeGreaterThanOrEqual(
					dates[i + 1].getTime()
				);
			}
		});

		it("limits fields in response", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ fields: "rating,comment" },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(3);

			res.body.data.reviews.forEach((review: any) => {
				expect(review).toHaveProperty("rating");
				expect(review).toHaveProperty("comment");
				expect(review).toHaveProperty("_id"); // Always included
				// Should not have other fields like user, product details
			});
		});

		it("combines multiple query parameters", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{
					"rating[gte]": 3,
					sort: "-rating",
					limit: 1,
					page: 1,
				},
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(1);
			expect(res.body.data.reviews[0].rating).toBe(5); // Highest rating first
			expect(res.body.pagination.totalResults).toBe(2); // Total matching filter
		});
	});

	describe("edge cases", () => {
		it("handles invalid query parameters gracefully", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ page: "invalid", limit: "abc" },
				cookie
			);

			expect(res.status).toBe(200); // Should still work with default values
		});

		it("handles negative page numbers", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ page: -1 },
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.pagination.page).toBe(1); // Should default to page 1
		});

		it("handles zero limit", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ limit: 0 },
				cookie
			);

			expect(res.status).toBe(200);
			// Should use default limit or handle gracefully
		});

		it("returns reviews only for specified product", async () => {
			// Create another product with reviews
			const anotherProduct = await createTestProduct();
			await createTestReview(
				anotherProduct._id.toString(),
				user._id.toString(),
				{
					rating: 2,
					comment: "Different product review",
				}
			);

			// Create review for original product
			await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{
					rating: 4,
					comment: "Original product review",
				}
			);

			const res = await getAllReviewsRequest(
				product._id.toString(),
				{},
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.results).toBe(1);
			expect(res.body.data.reviews[0].product._id).toBe(
				product._id.toString()
			);
			expect(res.body.data.reviews[0].comment).toBe(
				"Original product review"
			);
		});
	});
});
