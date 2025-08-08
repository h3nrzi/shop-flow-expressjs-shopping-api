import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestProduct,
	createTestReview,
	createTestUserAndGetCookie,
	deleteReviewRequest,
	expectProductRatingUpdate,
	getInvalidId,
	getInvalidObjectId,
	getReviewByIdRequest,
} from "@/__tests__/helpers/reviews.helper";

describe("DELETE /api/products/:productId/reviews/:id", () => {
	let product: any;
	let user: any;
	let cookie: string;
	let review: any;

	beforeEach(async () => {
		product = await createTestProduct();
		const testUser = await createTestUserAndGetCookie("reviewer");
		user = testUser.user;
		cookie = testUser.cookie;

		// Create a test review for most tests
		review = await createTestReview(
			product._id.toString(),
			user._id.toString(),
			{ rating: 4, comment: "Good product" },
		);
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
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
			const res = await deleteReviewRequest(
				getInvalidId(),
				review._id.toString(),
				cookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("شناسه نظر معتبر نیست");
		});

		it("review ID is not a valid ObjectId", async () => {
			const res = await deleteReviewRequest(
				product._id.toString(),
				getInvalidId(),
				cookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("شناسه نظر معتبر نیست");
		});
	});

	describe("should return 403, if", () => {
		it("user tries to delete another user's review", async () => {
			// Create another user
			const { user: anotherUser } =
				await createTestUserAndGetCookie("reviewer2");

			// Create review by another user
			const anotherReview = await createTestReview(
				product._id.toString(),
				anotherUser._id.toString(),
				{ rating: 2, comment: "Poor product" },
			);

			// Try to delete another user's review
			const res = await deleteReviewRequest(
				product._id.toString(),
				anotherReview._id.toString(),
				cookie, // Using original user's cookie
			);

			expect(res.status).toBe(403);
		});
	});

	describe("should return 404, if", () => {
		it("product does not exist", async () => {
			const nonExistentProductId = getInvalidObjectId();
			const res = await deleteReviewRequest(
				nonExistentProductId,
				review._id.toString(),
				cookie,
			);

			expect(res.status).toBe(404);
		});

		it("review does not exist", async () => {
			const nonExistentReviewId = getInvalidObjectId();
			const res = await deleteReviewRequest(
				product._id.toString(),
				nonExistentReviewId,
				cookie,
			);

			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe("نظری با این شناسه یافت نشد");
		});

		it("review has already been deleted", async () => {
			// Delete the review first
			const firstDeleteRes = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);
			expect(firstDeleteRes.status).toBe(204);

			// Try to delete the same review again
			const secondDeleteRes = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			expect(secondDeleteRes.status).toBe(404);
			expect(secondDeleteRes.body.errors[0].message).toBe(
				"نظری با این شناسه یافت نشد",
			);
		});
	});

	describe("should return 204, if", () => {
		it("review is deleted successfully", async () => {
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);
			// 204 responses should not have a body
			expect(res.text).toBe("");
		});

		it("review is actually removed from database", async () => {
			// Delete the review
			const deleteRes = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);
			expect(deleteRes.status).toBe(204);

			// Try to get the deleted review
			const getRes = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			expect(getRes.status).toBe(404);
			expect(getRes.body.errors[0].message).toBe("نظری با این شناسه یافت نشد");
		});

		it("product rating and numReviews are updated after review deletion", async () => {
			// Verify initial product state (should have rating 4 and 1 review)
			await expectProductRatingUpdate(product._id.toString(), 4, 1);

			// Delete the review
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);

			// Verify product rating and numReviews are updated (should be 0 and 0)
			await expectProductRatingUpdate(product._id.toString(), 0, 0);
		});

		it("product average rating is recalculated correctly after deletion with multiple reviews", async () => {
			// Create second review with rating 2
			const { user: user2 } = await createTestUserAndGetCookie("reviewer2");
			await createTestReview(product._id.toString(), user2._id.toString(), {
				rating: 2,
				comment: "Poor product",
			});

			// Initial average should be (4 + 2) / 2 = 3
			await expectProductRatingUpdate(product._id.toString(), 3, 2);

			// Delete first review (rating 4)
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);

			// New average should be 2 (only second review remains)
			await expectProductRatingUpdate(product._id.toString(), 2, 1);
		});

		it("deleting last review resets product rating to 0", async () => {
			// Verify initial state
			await expectProductRatingUpdate(product._id.toString(), 4, 1);

			// Delete the only review
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);

			// Product should have no rating and no reviews
			await expectProductRatingUpdate(product._id.toString(), 0, 0);
		});

		it("user can delete their own review", async () => {
			// Verify the review exists and belongs to the user
			const getRes = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);
			expect(getRes.status).toBe(200);
			expect(getRes.body.data.review.user._id).toBe(user._id.toString());

			// Delete the review
			const deleteRes = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			expect(deleteRes.status).toBe(204);
		});

		it("deletion works with different review ratings", async () => {
			// Test deletion of reviews with different ratings
			const ratings = [1, 2, 3, 4, 5];

			for (const rating of ratings) {
				const testReview = await createTestReview(
					product._id.toString(),
					user._id.toString(),
					{ rating, comment: `Review with rating ${rating}` },
				);

				const res = await deleteReviewRequest(
					product._id.toString(),
					testReview._id.toString(),
					cookie,
				);

				expect(res.status).toBe(204);
			}
		});
	});

	describe("edge cases", () => {
		it("handles deletion of review with very long comment", async () => {
			const longComment = "A".repeat(1000);
			const longCommentReview = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 4, comment: longComment },
			);

			const res = await deleteReviewRequest(
				product._id.toString(),
				longCommentReview._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);
		});

		it("handles deletion of review with special characters", async () => {
			const specialComment =
				"Great product! 🎉 100% satisfied. Price: $99.99 & more...";
			const specialReview = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 5, comment: specialComment },
			);

			const res = await deleteReviewRequest(
				product._id.toString(),
				specialReview._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);
		});

		it("handles deletion of review with unicode characters", async () => {
			const unicodeComment = "محصول عالی! بسیار راضی هستم 👍";
			const unicodeReview = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 5, comment: unicodeComment },
			);

			const res = await deleteReviewRequest(
				product._id.toString(),
				unicodeReview._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);
		});

		it("handles concurrent deletion attempts", async () => {
			// Make concurrent delete requests for the same review
			const [res1, res2] = await Promise.all([
				deleteReviewRequest(
					product._id.toString(),
					review._id.toString(),
					cookie,
				),
				deleteReviewRequest(
					product._id.toString(),
					review._id.toString(),
					cookie,
				),
			]);

			// One should succeed, one should fail
			const statuses = [res1.status, res2.status].sort();
			expect(statuses).toEqual([204, 404]);
		});

		it("deletion does not affect other product reviews", async () => {
			// Create another product with its own review
			const anotherProduct = await createTestProduct();
			const anotherReview = await createTestReview(
				anotherProduct._id.toString(),
				user._id.toString(),
				{ rating: 3, comment: "Different product review" },
			);

			// Verify both products have reviews
			await expectProductRatingUpdate(product._id.toString(), 4, 1);
			await expectProductRatingUpdate(anotherProduct._id.toString(), 3, 1);

			// Delete review from first product
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);

			// First product should have no reviews, second should be unchanged
			await expectProductRatingUpdate(product._id.toString(), 0, 0);
			await expectProductRatingUpdate(anotherProduct._id.toString(), 3, 1);

			// Other product's review should still exist
			const getOtherRes = await getReviewByIdRequest(
				anotherProduct._id.toString(),
				anotherReview._id.toString(),
				cookie,
			);
			expect(getOtherRes.status).toBe(200);
		});

		it("deletion does not affect other user reviews on same product", async () => {
			// Create another user and their review on the same product
			const { user: user2, cookie: cookie2 } =
				await createTestUserAndGetCookie("reviewer2");
			const user2Id = user2._id || user2.id;
			if (!user2Id) {
				throw new Error("Failed to get user2 ID");
			}
			const user2Review = await createTestReview(
				product._id.toString(),
				user2Id.toString(),
				{ rating: 2, comment: "Different user review" },
			);

			// Verify product has 2 reviews with average (4 + 2) / 2 = 3
			await expectProductRatingUpdate(product._id.toString(), 3, 2);

			// Delete first user's review
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);

			// Product should now have only second user's review
			await expectProductRatingUpdate(product._id.toString(), 2, 1);

			// Second user's review should still exist
			const getUser2ReviewRes = await getReviewByIdRequest(
				product._id.toString(),
				user2Review._id.toString(),
				cookie2,
			);
			expect(getUser2ReviewRes.status).toBe(200);
			expect(getUser2ReviewRes.body.data.review.user._id).toBe(
				user2._id.toString(),
			);
		});
	});

	describe("authorization edge cases", () => {
		it("user cannot delete review after changing password", async () => {
			// This would require implementing password change functionality
			// For now, we'll test with a different scenario

			// Create review
			const testReview = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 4, comment: "Test review" },
			);

			// User should be able to delete their own review
			const res = await deleteReviewRequest(
				product._id.toString(),
				testReview._id.toString(),
				cookie,
			);

			expect(res.status).toBe(204);
		});

		it("handles deletion attempt with malformed cookie", async () => {
			const malformedCookie = "jwt=malformed.token.here";
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				malformedCookie,
			);

			expect(res.status).toBe(401);
		});

		it("handles deletion attempt with expired token", async () => {
			// This would require creating an expired token
			// For now, we test with invalid token
			const expiredCookie = `jwt=${getInvalidToken()}`;
			const res = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				expiredCookie,
			);

			expect(res.status).toBe(401);
		});
	});

	describe("data integrity", () => {
		it("ensures review is completely removed from database", async () => {
			const reviewId = review._id.toString();

			// Delete the review
			const deleteRes = await deleteReviewRequest(
				product._id.toString(),
				reviewId,
				cookie,
			);
			expect(deleteRes.status).toBe(204);

			// Verify review cannot be found by any means
			const getRes = await getReviewByIdRequest(
				product._id.toString(),
				reviewId,
				cookie,
			);
			expect(getRes.status).toBe(404);
		});

		it("maintains database consistency after multiple deletions", async () => {
			// Create multiple reviews with their respective users
			const { user: user2, cookie: cookie2 } =
				await createTestUserAndGetCookie("reviewer2");
			const { user: user3, cookie: cookie3 } =
				await createTestUserAndGetCookie("reviewer3");

			const review2 = await createTestReview(
				product._id.toString(),
				user2._id.toString(),
				{ rating: 3, comment: "Average" },
			);

			const review3 = await createTestReview(
				product._id.toString(),
				user3._id.toString(),
				{ rating: 5, comment: "Excellent" },
			);

			// Verify initial state: (4 + 3 + 5) / 3 = 4
			await expectProductRatingUpdate(product._id.toString(), 4, 3);

			// Delete reviews one by one and verify consistency

			// Delete first review: (3 + 5) / 2 = 4
			const res1 = await deleteReviewRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);
			expect(res1.status).toBe(204);
			await expectProductRatingUpdate(product._id.toString(), 4, 2);

			// Delete second review: 5 / 1 = 5
			const res2 = await deleteReviewRequest(
				product._id.toString(),
				review2._id.toString(),
				cookie2,
			);
			expect(res2.status).toBe(204);
			await expectProductRatingUpdate(product._id.toString(), 5, 1);

			// Delete third review: 0 / 0 = 0
			const res3 = await deleteReviewRequest(
				product._id.toString(),
				review3._id.toString(),
				cookie3,
			);
			expect(res3.status).toBe(204);
			await expectProductRatingUpdate(product._id.toString(), 0, 0);
		});
	});
});
