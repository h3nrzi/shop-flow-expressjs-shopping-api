import {
	createReviewRequest,
	createTestProduct,
	createTestReview,
	createTestUserAndGetCookie,
	getAllReviewsRequest,
	getInvalidObjectId,
	updateReviewRequest,
} from "@/__tests__/helpers/reviews.helper";

describe("Review Middleware Integration Tests", () => {
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

	describe("beforeGetAll Middleware", () => {
		it("sets initialFilter with productId from URL params", async () => {
			// Create reviews for this product
			await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 4, comment: "Product review" }
			);

			// Create another product and review to ensure filtering works
			const anotherProduct = await createTestProduct();
			await createTestReview(
				anotherProduct._id.toString(),
				user._id.toString(),
				{ rating: 3, comment: "Another product review" }
			);

			// Get reviews for specific product
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
				"Product review"
			);
		});

		it("correctly filters reviews by product when multiple products exist", async () => {
			// Create multiple products with reviews
			const products = [product];
			const expectedReviewCounts = [3, 2, 1];

			// Create additional products
			for (let i = 1; i < 3; i++) {
				products.push(await createTestProduct());
			}

			// Create different numbers of reviews for each product
			for (let i = 0; i < products.length; i++) {
				for (let j = 0; j < expectedReviewCounts[i]; j++) {
					const { user: reviewUser } =
						await createTestUserAndGetCookie(`user${i}_${j}`);
					await createTestReview(
						products[i]._id.toString(),
						reviewUser._id.toString(),
						{
							rating: j + 3,
							comment: `Review ${j + 1} for product ${i + 1}`,
						}
					);
				}
			}

			// Test that each product returns only its own reviews
			for (let i = 0; i < products.length; i++) {
				const res = await getAllReviewsRequest(
					products[i]._id.toString(),
					{},
					cookie
				);

				expect(res.status).toBe(200);
				expect(res.body.results).toBe(expectedReviewCounts[i]);

				// Verify all returned reviews belong to the correct product
				res.body.data.reviews.forEach((review: any) => {
					expect(review.product._id).toBe(
						products[i]._id.toString()
					);
				});
			}
		});
	});

	describe("beforeCreate Middleware", () => {
		it("sets user from authenticated user (req.user._id)", async () => {
			const reviewData = {
				rating: 4,
				comment: "Great product",
				// Note: not providing user field - middleware should set it
			};

			const res = await createReviewRequest(
				product._id.toString(),
				reviewData,
				cookie
			);

			expect(res.status).toBe(201);
			expect(res.body.data.review.user._id).toBe(
				user._id.toString()
			);
		});

		it("sets product from URL params (req.params.productId)", async () => {
			const reviewData = {
				rating: 4,
				comment: "Great product",
				// Note: not providing product field - middleware should set it
			};

			const res = await createReviewRequest(
				product._id.toString(),
				reviewData,
				cookie
			);

			expect(res.status).toBe(201);
			expect(res.body.data.review.product._id).toBe(
				product._id.toString()
			);
		});

		it("overrides user field if provided in body with authenticated user", async () => {
			const reviewData = {
				rating: 4,
				comment: "Great product",
				user: getInvalidObjectId(), // This should be overridden by middleware
			};

			const res = await createReviewRequest(
				product._id.toString(),
				reviewData,
				cookie
			);

			expect(res.status).toBe(201);
			// Should use authenticated user, not the one provided in body
			expect(res.body.data.review.user._id).toBe(
				user._id.toString()
			);
			expect(res.body.data.review.user._id).not.toBe(
				reviewData.user
			);
		});

		it("overrides product field if provided in body with URL param", async () => {
			const reviewData = {
				rating: 4,
				comment: "Great product",
				product: getInvalidObjectId(), // This should be overridden by middleware
			};

			const res = await createReviewRequest(
				product._id.toString(),
				reviewData,
				cookie
			);

			expect(res.status).toBe(201);
			// Should use product from URL, not the one provided in body
			expect(res.body.data.review.product._id).toBe(
				product._id.toString()
			);
			expect(res.body.data.review.product._id).not.toBe(
				reviewData.product
			);
		});

		it("preserves rating and comment from request body", async () => {
			const reviewData = {
				rating: 5,
				comment: "Excellent product with detailed review",
			};

			const res = await createReviewRequest(
				product._id.toString(),
				reviewData,
				cookie
			);

			expect(res.status).toBe(201);
			expect(res.body.data.review.rating).toBe(
				reviewData.rating
			);
			expect(res.body.data.review.comment).toBe(
				reviewData.comment
			);
		});

		it("creates clean request body with only necessary fields", async () => {
			const reviewData = {
				rating: 4,
				comment: "Great product",
				extraField: "should be ignored",
				anotherField: 123,
				user: getInvalidObjectId(),
				product: getInvalidObjectId(),
			} as any;

			const res = await createReviewRequest(
				product._id.toString(),
				reviewData,
				cookie
			);

			expect(res.status).toBe(201);

			const review = res.body.data.review;
			expect(review.rating).toBe(4);
			expect(review.comment).toBe("Great product");
			expect(review.user._id).toBe(user._id.toString());
			expect(review.product._id).toBe(product._id.toString());

			// Extra fields should not be present
			expect(review).not.toHaveProperty("extraField");
			expect(review).not.toHaveProperty("anotherField");
		});
	});

	describe("beforeUpdate Middleware", () => {
		let review: any;

		beforeEach(async () => {
			review = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 3, comment: "Original comment" }
			);
		});

		it("filters update body to only include rating and comment", async () => {
			const updateData = {
				rating: 5,
				comment: "Updated comment",
				user: getInvalidObjectId(), // Should be filtered out
				product: getInvalidObjectId(), // Should be filtered out
				extraField: "should be ignored", // Should be filtered out
				_id: getInvalidObjectId(), // Should be filtered out
			} as any;

			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;
			expect(updatedReview.rating).toBe(5);
			expect(updatedReview.comment).toBe("Updated comment");

			// Original user and product should be preserved
			expect(updatedReview.user._id).toBe(user._id.toString());
			expect(updatedReview.product._id).toBe(
				product._id.toString()
			);
			expect(updatedReview._id).toBe(review._id.toString());

			// Extra fields should not affect the review
			expect(updatedReview).not.toHaveProperty("extraField");
		});

		it("allows partial updates with only rating", async () => {
			const updateData = {
				rating: 1,
				extraField: "should be ignored",
			} as any;

			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;
			expect(updatedReview.rating).toBe(1);
			expect(updatedReview.comment).toBe("Original comment"); // Should remain unchanged
		});

		it("allows partial updates with only comment", async () => {
			const updateData = {
				comment: "Only comment updated",
				extraField: "should be ignored",
			} as any;

			const res = await updateReviewRequest(
				product._id.toString(),
				review._id.toString(),
				updateData,
				cookie
			);

			expect(res.status).toBe(200);

			const updatedReview = res.body.data.review;
			expect(updatedReview.rating).toBe(3); // Should remain unchanged
			expect(updatedReview.comment).toBe("Only comment updated");
		});

		it("handles empty update object", async () => {
			const updateData = {
				extraField: "should be ignored",
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
			// Should remain unchanged
			expect(updatedReview.rating).toBe(3);
			expect(updatedReview.comment).toBe("Original comment");
		});
	});

	describe("Middleware Integration with Authentication", () => {
		it("beforeCreate works correctly with authenticated user", async () => {
			// Create another user
			const { user: anotherUser, cookie: anotherCookie } =
				await createTestUserAndGetCookie("reviewer2");

			const reviewData = {
				rating: 4,
				comment: "Review by second user",
			};

			const res = await createReviewRequest(
				product._id.toString(),
				reviewData,
				anotherCookie
			);

			expect(res.status).toBe(201);
			// Should use the authenticated user (anotherUser), not the original user
			expect(res.body.data.review.user._id).toBe(
				anotherUser._id.toString()
			);
			expect(res.body.data.review.user._id).not.toBe(
				user._id.toString()
			);
		});

		it("middleware respects authentication context for different users", async () => {
			// Create multiple users and reviews
			const users = [];
			const cookies = [];

			for (let i = 0; i < 3; i++) {
				const { user: testUser, cookie: testCookie } =
					await createTestUserAndGetCookie(`reviewer${i}`);
				users.push(testUser);
				cookies.push(testCookie);
			}

			// Each user creates a review
			for (let i = 0; i < users.length; i++) {
				const res = await createReviewRequest(
					product._id.toString(),
					{ rating: i + 3, comment: `Review by user ${i}` },
					cookies[i]
				);

				expect(res.status).toBe(201);
				expect(res.body.data.review.user._id).toBe(
					users[i]._id.toString()
				);
			}

			// Verify all reviews exist and belong to correct users
			const allReviewsRes = await getAllReviewsRequest(
				product._id.toString(),
				{},
				cookie
			);
			expect(allReviewsRes.status).toBe(200);
			expect(allReviewsRes.body.results).toBe(3);

			// Check that each review belongs to the correct user
			const reviewUserIds = allReviewsRes.body.data.reviews.map(
				(r: any) => r.user._id
			);
			const expectedUserIds = users.map(u => u._id.toString());

			expectedUserIds.forEach(userId => {
				expect(reviewUserIds).toContain(userId);
			});
		});
	});
});
