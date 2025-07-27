import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestProduct,
	createTestReview,
	createTestUserAndGetCookie,
	expectProductRatingUpdate,
	expectValidReviewResponse,
	getInvalidId,
	getInvalidObjectId,
	updateReviewRequest,
} from "@/__tests__/helpers/reviews.helper";

describe("PATCH /api/products/:productId/reviews/:id", () => {
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
			{ rating: 3, comment: "Average product" }
		);
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const updateData = {
				rating: 4,
				comment: "Updated comment",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const updateData = {
				rating: 4,
				comment: "Updated comment",
			};
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
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
			const updateData = {
				rating: 4,
				comment: "Updated comment",
			};
			const res = await updateReviewRequest(
				getInvalidId(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(400);
		});

		it("review ID is not a valid ObjectId", async () => {
			const updateData = {
				rating: 4,
				comment: "Updated comment",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				getInvalidId(),
				updateData,
				cookie
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"شناسه نظر معتبر نیست"
			);
		});

		it("rating is below minimum (0)", async () => {
			const updateData = { rating: 0 };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"امتیاز باید بین 1 و 5 باشد"
			);
		});

		it("rating is above maximum (6)", async () => {
			const updateData = { rating: 6 };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"امتیاز باید بین 1 و 5 باشد"
			);
		});

		it("rating is not a number", async () => {
			const updateData = { rating: "five" as any };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"امتیاز باید بین 1 و 5 باشد"
			);
		});

		it("comment is not a string", async () => {
			const updateData = { comment: 123 as any };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(
				"فرمت نظر معتبر نیست"
			);
		});

		it("product field is provided (should be ignored by middleware)", async () => {
			const updateData = {
				rating: 4,
				comment: "Updated comment",
				product: getInvalidObjectId(), // This should be ignored
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			// Should succeed because middleware filters out product field
			expect(res.status).toBe(200);
			expect(res.body.data.review.product._id).toBe(
				product._id.toString()
			);
		});
	});

	describe("should return 403, if", () => {
		it("user tries to update another user's review", async () => {
			// Create another user
			const { user: anotherUser } =
				await createTestUserAndGetCookie("reviewer2");

			// Create review by another user
			const anotherReview = await createTestReview(
				product._id.toString(),
				anotherUser._id.toString(),
				{ rating: 2, comment: "Poor product" }
			);

			// Try to update another user's review
			const updateData = {
				rating: 5,
				comment: "Trying to update others review",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				anotherReview._id.toString(),
				updateData,
				cookie // Using original user's cookie
			);

			expect(res.status).toBe(403);
		});
	});

	describe("should return 404, if", () => {
		it("product does not exist", async () => {
			const nonExistentProductId = getInvalidObjectId();
			const updateData = {
				rating: 4,
				comment: "Updated comment",
			};
			const res = await updateReviewRequest(
				nonExistentProductId,
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(404);
		});

		it("review does not exist", async () => {
			const nonExistentReviewId = getInvalidObjectId();
			const updateData = {
				rating: 4,
				comment: "Updated comment",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				nonExistentReviewId,
				updateData,
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

			// Try to update the other product's review using wrong product ID
			const updateData = {
				rating: 4,
				comment: "Updated comment",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				anotherReview._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe(
				"نظری با این شناسه یافت نشد"
			);
		});
	});

	describe("should return 200, if", () => {
		it("review is updated successfully with both rating and comment", async () => {
			const updateData = {
				rating: 5,
				comment: "Excellent product after update!",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data).toHaveProperty("review");

			const updatedReview = res.body.data.review;
			expectValidReviewResponse(updatedReview, updateData);
			expect(updatedReview._id).toBe(review._id.toString());
			expect(updatedReview.rating).toBe(5);
			expect(updatedReview.comment).toBe(
				"Excellent product after update!"
			);
		});

		it("review is updated with only rating", async () => {
			const updateData = { rating: 1 };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;
			expect(updatedReview.rating).toBe(1);
			expect(updatedReview.comment).toBe("Average product"); // Should remain unchanged
		});

		it("review is updated with only comment", async () => {
			const updateData = { comment: "Updated comment only" };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;
			expect(updatedReview.rating).toBe(3); // Should remain unchanged
			expect(updatedReview.comment).toBe("Updated comment only");
		});

		it("review is updated with minimum rating (1)", async () => {
			const updateData = {
				rating: 1,
				comment: "Very poor product",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.review.rating).toBe(1);
		});

		it("review is updated with maximum rating (5)", async () => {
			const updateData = {
				rating: 5,
				comment: "Perfect product",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.review.rating).toBe(5);
		});

		it("product rating is recalculated after review update", async () => {
			// Verify initial product rating (should be 3 from the single review)
			await expectProductRatingUpdate(
				product._id.toString(),
				3,
				1
			);

			// Update the review rating
			const updateData = { rating: 5 };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			// Verify product rating is updated to 5
			await expectProductRatingUpdate(
				product._id.toString(),
				5,
				1
			);
		});

		it("product average rating is recalculated correctly with multiple reviews", async () => {
			// Create second review with rating 5
			const { user: user2 } = await createTestUserAndGetCookie(
				"reviewer2"
			);
			await createTestReview(
				product._id.toString(),
				user2._id.toString(),
				{ rating: 5, comment: "Excellent!" }
			);

			// Initial average should be (3 + 5) / 2 = 4
			await expectProductRatingUpdate(
				product._id.toString(),
				4,
				2
			);

			// Update first review from 3 to 1
			const updateData = { rating: 1 };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			// New average should be (1 + 5) / 2 = 3
			await expectProductRatingUpdate(
				product._id.toString(),
				3,
				2
			);
		});

		it("updated review includes populated user and product data", async () => {
			const updateData = {
				rating: 4,
				comment: "Updated review",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;

			// Check user population
			expect(updatedReview.user).toHaveProperty("_id");
			expect(updatedReview.user).toHaveProperty("name");
			expect(updatedReview.user).toHaveProperty("email");
			expect(updatedReview.user._id).toBe(user._id.toString());

			// Check product population
			expect(updatedReview.product).toHaveProperty("_id");
			expect(updatedReview.product).toHaveProperty("name");
			expect(updatedReview.product).toHaveProperty("price");
			expect(updatedReview.product._id).toBe(
				product._id.toString()
			);
		});

		it("updatedAt timestamp is modified after update", async () => {
			const originalUpdatedAt = review.updatedAt;

			// Wait a moment to ensure timestamp difference
			await new Promise(resolve => setTimeout(resolve, 10));

			const updateData = {
				rating: 4,
				comment: "Updated review",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;
			expect(
				new Date(updatedReview.updatedAt).getTime()
			).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
		});

		it("createdAt timestamp remains unchanged after update", async () => {
			const originalCreatedAt = review.createdAt;

			const updateData = {
				rating: 4,
				comment: "Updated review",
			};
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;
			expect(updatedReview.createdAt).toBe(
				originalCreatedAt.toISOString()
			);
		});
	});

	describe("edge cases", () => {
		it("handles empty update object", async () => {
			const updateData = {};
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			// Review should remain unchanged
			const updatedReview = res.body.data.review;
			expect(updatedReview.rating).toBe(3);
			expect(updatedReview.comment).toBe("Average product");
		});

		it("handles very long comment update", async () => {
			const longComment = "A".repeat(1000);
			const updateData = { comment: longComment };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.review.comment).toBe(longComment);
			expect(res.body.data.review.comment.length).toBe(1000);
		});

		it("handles special characters in comment update", async () => {
			const specialComment =
				"Updated! 🎉 100% better now. Price: $99.99 & more...";
			const updateData = { comment: specialComment };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.review.comment).toBe(specialComment);
		});

		it("handles unicode characters in comment update", async () => {
			const unicodeComment = "به‌روزرسانی شد! محصول عالی 👍";
			const updateData = { comment: unicodeComment };
			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);
			expect(res.body.data.review.comment).toBe(unicodeComment);
		});

		it("ignores unknown fields in update data", async () => {
			const updateData = {
				rating: 4,
				comment: "Updated comment",
				unknownField: "should be ignored",
				anotherField: 123,
			} as any;

			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;
			expect(updatedReview.rating).toBe(4);
			expect(updatedReview.comment).toBe("Updated comment");
			expect(updatedReview).not.toHaveProperty("unknownField");
			expect(updatedReview).not.toHaveProperty("anotherField");
		});

		it("handles concurrent update attempts", async () => {
			const updateData1 = { rating: 4, comment: "First update" };
			const updateData2 = {
				rating: 5,
				comment: "Second update",
			};

			// Make concurrent update requests
			const [res1, res2] = await Promise.all([
				updateReviewRequest(
					product._id.toString(),
					review._id.toString(),
					updateData1,
					cookie
				),
				updateReviewRequest(
					product._id.toString(),
					review._id.toString(),
					updateData2,
					cookie
				),
			]);

			// Both should succeed (last one wins)
			expect(res1.status).toBe(200);
			expect(res2.status).toBe(200);
		});
	});

	describe("middleware functionality", () => {
		it("middleware correctly filters update fields", async () => {
			// Include fields that should be filtered out by middleware
			const updateData = {
				rating: 4,
				comment: "Updated comment",
				user: getInvalidObjectId(), // Should be filtered out
				product: getInvalidObjectId(), // Should be filtered out
				_id: getInvalidObjectId(), // Should be filtered out
				createdAt: new Date().toISOString(), // Should be filtered out
			} as any;

			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;
			expect(updatedReview.rating).toBe(4);
			expect(updatedReview.comment).toBe("Updated comment");
			expect(updatedReview.user._id).toBe(user._id.toString()); // Should remain original
			expect(updatedReview.product._id).toBe(
				product._id.toString()
			); // Should remain original
			expect(updatedReview._id).toBe(review._id.toString()); // Should remain original
		});
	});
});
