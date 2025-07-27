import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestProduct,
	createTestReview,
	createTestUserAndGetCookie,
	expectValidReviewResponse,
	getInvalidId,
	getInvalidObjectId,
	getReviewByIdRequest,
} from "@/__tests__/helpers/reviews.helper";

describe("GET /api/products/:productId/reviews/:id", () => {
	let product: any;
	let user: any;
	let cookie: string;
	let review: any;

	beforeEach(async () => {
		product = await createTestProduct();
		const testUser = await createTestUserAndGetCookie(
			"reviewer"
		);
		user = testUser.user;
		cookie = testUser.cookie;

		// Create a test review for most tests
		review = await createTestReview(
			product._id.toString(),
			user._id.toString(),
			{ rating: 4, comment: "Good product" }
		);
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString()
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
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
			const res = await getReviewByIdRequest(
				getInvalidId(),
				review._id.toString(),
				cookie
			);

			expect(res.status).toBe(400);
		});

		it("review ID is not a valid ObjectId", async () => {
			const res = await getReviewByIdRequest(
				product._id.toString(),
				getInvalidId(),
				cookie
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"شناسه نظر معتبر نیست"
			);
		});
	});

	describe("should return 404, if", () => {
		it("product does not exist", async () => {
			const nonExistentProductId = getInvalidObjectId();
			const res = await getReviewByIdRequest(
				nonExistentProductId,
				review._id.toString(),
				cookie
			);

			expect(res.status).toBe(404);
		});

		it("review does not exist", async () => {
			const nonExistentReviewId = getInvalidObjectId();
			const res = await getReviewByIdRequest(
				product._id.toString(),
				nonExistentReviewId,
				cookie
			);

			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe(
				"نظری با این شناسه یافت نشد"
			);
		});

		it("review exists but belongs to different product", async () => {
			// Create another product and review
			const anotherProduct = await createTestProduct();
			const anotherReview = await createTestReview(
				anotherProduct._id.toString(),
				user._id.toString(),
				{ rating: 3, comment: "Different product review" }
			);

			// Try to get the other product's review using wrong product ID
			const res = await getReviewByIdRequest(
				product._id.toString(),
				anotherReview._id.toString(),
				cookie
			);

			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe(
				"نظری با این شناسه یافت نشد"
			);
		});
	});

	describe("should return 200, if", () => {
		it("review is found successfully", async () => {
			const res = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data).toHaveProperty("review");

			const returnedReview = res.body.data.review;
			expectValidReviewResponse(returnedReview, {
				rating: 4,
				comment: "Good product",
			});
			expect(returnedReview._id).toBe(review._id.toString());
		});

		it("review includes populated user data", async () => {
			const res = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie
			);

			expect(res.status).toBe(200);

			const returnedReview = res.body.data.review;

			// Check user population
			expect(returnedReview.user).toHaveProperty("_id");
			expect(returnedReview.user).toHaveProperty("name");
			expect(returnedReview.user).toHaveProperty("email");
			expect(returnedReview.user._id).toBe(user._id.toString());
		});

		it("review includes populated product data", async () => {
			const res = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie
			);

			expect(res.status).toBe(200);

			const returnedReview = res.body.data.review;

			// Check product population
			expect(returnedReview.product).toHaveProperty("_id");
			expect(returnedReview.product).toHaveProperty("name");
			expect(returnedReview.product).toHaveProperty("price");
			expect(returnedReview.product).toHaveProperty(
				"description"
			);
			expect(returnedReview.product._id).toBe(
				product._id.toString()
			);
		});

		it("returns review with all expected fields", async () => {
			const res = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie
			);

			expect(res.status).toBe(200);

			const returnedReview = res.body.data.review;

			// Check all required fields
			expect(returnedReview).toHaveProperty("_id");
			expect(returnedReview).toHaveProperty("rating");
			expect(returnedReview).toHaveProperty("comment");
			expect(returnedReview).toHaveProperty("user");
			expect(returnedReview).toHaveProperty("product");
			expect(returnedReview).toHaveProperty("createdAt");
			expect(returnedReview).toHaveProperty("updatedAt");

			// Verify data types
			expect(typeof returnedReview._id).toBe("string");
			expect(typeof returnedReview.rating).toBe("number");
			expect(typeof returnedReview.comment).toBe("string");
			expect(typeof returnedReview.user).toBe("object");
			expect(typeof returnedReview.product).toBe("object");
			expect(typeof returnedReview.createdAt).toBe("string");
			expect(typeof returnedReview.updatedAt).toBe("string");
		});

		it("returns review with correct rating range", async () => {
			// Test with minimum rating
			const minRatingReview = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 1, comment: "Poor product" }
			);

			const res1 = await getReviewByIdRequest(
				product._id.toString(),
				minRatingReview._id.toString(),
				cookie
			);

			expect(res1.status).toBe(200);
			expect(res1.body.data.review.rating).toBe(1);

			// Test with maximum rating
			const maxRatingReview = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 5, comment: "Excellent product" }
			);

			const res2 = await getReviewByIdRequest(
				product._id.toString(),
				maxRatingReview._id.toString(),
				cookie
			);

			expect(res2.status).toBe(200);
			expect(res2.body.data.review.rating).toBe(5);
		});

		it("returns review created by different user", async () => {
			// Create another user and their review
			const { user: anotherUser, cookie: anotherCookie } =
				await createTestUserAndGetCookie("reviewer2");

			const anotherReview = await createTestReview(
				product._id.toString(),
				anotherUser._id.toString(),
				{ rating: 3, comment: "Average product" }
			);

			// Original user should be able to view other user's review
			const res = await getReviewByIdRequest(
				product._id.toString(),
				anotherReview._id.toString(),
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.review._id).toBe(
				anotherReview._id.toString()
			);
			expect(res.body.data.review.user._id).toBe(
				anotherUser._id.toString()
			);
			expect(res.body.data.review.rating).toBe(3);
			expect(res.body.data.review.comment).toBe(
				"Average product"
			);
		});
	});

	describe("edge cases", () => {
		it("handles review with very long comment", async () => {
			const longComment = "A".repeat(1000);
			const longCommentReview = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 4, comment: longComment }
			);

			const res = await getReviewByIdRequest(
				product._id.toString(),
				longCommentReview._id.toString(),
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.review.comment).toBe(longComment);
			expect(res.body.data.review.comment.length).toBe(1000);
		});

		it("handles review with special characters in comment", async () => {
			const specialComment =
				"Great product! 🎉 100% satisfied. Price: $99.99 & more...";
			const specialReview = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 5, comment: specialComment }
			);

			const res = await getReviewByIdRequest(
				product._id.toString(),
				specialReview._id.toString(),
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.review.comment).toBe(specialComment);
		});

		it("handles review with unicode characters", async () => {
			const unicodeComment = "محصول عالی! بسیار راضی هستم 👍";
			const unicodeReview = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 5, comment: unicodeComment }
			);

			const res = await getReviewByIdRequest(
				product._id.toString(),
				unicodeReview._id.toString(),
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.review.comment).toBe(unicodeComment);
		});

		it("returns consistent data structure regardless of review content", async () => {
			// Create reviews with different content types
			const reviews = [
				{ rating: 1, comment: "Bad" },
				{
					rating: 3,
					comment:
						"Average product with moderate length comment",
				},
				{ rating: 5, comment: "Excellent! " + "A".repeat(500) },
			];

			for (const reviewData of reviews) {
				const testReview = await createTestReview(
					product._id.toString(),
					user._id.toString(),
					reviewData
				);

				const res = await getReviewByIdRequest(
					product._id.toString(),
					testReview._id.toString(),
					cookie
				);

				expect(res.status).toBe(200);
				expect(res.body).toHaveProperty("status", "success");
				expect(res.body).toHaveProperty("data");
				expect(res.body.data).toHaveProperty("review");
				expectValidReviewResponse(
					res.body.data.review,
					reviewData
				);
			}
		});

		it("handles concurrent requests for same review", async () => {
			// Make multiple simultaneous requests for the same review
			const promises = Array(5)
				.fill(null)
				.map(() =>
					getReviewByIdRequest(
						product._id.toString(),
						review._id.toString(),
						cookie
					)
				);

			const responses = await Promise.all(promises);

			// All requests should succeed
			responses.forEach(res => {
				expect(res.status).toBe(200);
				expect(res.body.data.review._id).toBe(
					review._id.toString()
				);
			});
		});
	});

	describe("data consistency", () => {
		it("returns same data when accessed multiple times", async () => {
			const res1 = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie
			);

			const res2 = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie
			);

			expect(res1.status).toBe(200);
			expect(res2.status).toBe(200);

			// Compare the review data
			expect(res1.body.data.review._id).toBe(
				res2.body.data.review._id
			);
			expect(res1.body.data.review.rating).toBe(
				res2.body.data.review.rating
			);
			expect(res1.body.data.review.comment).toBe(
				res2.body.data.review.comment
			);
			expect(res1.body.data.review.createdAt).toBe(
				res2.body.data.review.createdAt
			);
		});

		it("returns review data that matches database record", async () => {
			const res = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie
			);

			expect(res.status).toBe(200);

			const returnedReview = res.body.data.review;

			// Verify the returned data matches what we created
			expect(returnedReview._id).toBe(review._id.toString());
			expect(returnedReview.rating).toBe(review.rating);
			expect(returnedReview.comment).toBe(review.comment);
			expect(returnedReview.user._id).toBe(
				review.user.toString()
			);
			expect(returnedReview.product._id).toBe(
				review.product.toString()
			);
		});
	});
});
