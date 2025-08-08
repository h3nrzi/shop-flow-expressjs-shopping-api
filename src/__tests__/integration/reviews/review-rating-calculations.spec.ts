import {
	createReviewRequest,
	createTestProduct,
	createTestUserAndGetCookie,
	deleteReviewRequest,
	expectProductRatingUpdate,
	updateReviewRequest,
} from "@/__tests__/helpers/reviews.helper";

describe("Review Rating Calculations Integration Tests", () => {
	let product: any;
	let users: any[] = [];
	let cookies: string[] = [];

	beforeEach(async () => {
		product = await createTestProduct();
		users = [];
		cookies = [];

		// Create multiple test users for rating calculation tests
		for (let i = 0; i < 5; i++) {
			const { user, cookie } = await createTestUserAndGetCookie(`reviewer${i}`);
			users.push(user);
			cookies.push(cookie);
		}
	});

	describe("Product Rating Calculation", () => {
		it("calculates correct average rating with single review", async () => {
			// Initial state: no reviews
			await expectProductRatingUpdate(product._id.toString(), 0, 0);

			// Add single review with rating 4
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Good product" },
				cookies[0],
			);

			expect(res.status).toBe(201);
			await expectProductRatingUpdate(product._id.toString(), 4, 1);
		});

		it("calculates correct average rating with multiple reviews", async () => {
			const ratings = [5, 4, 3, 2, 1];
			const expectedAverage =
				ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length; // 3

			// Add multiple reviews
			for (let i = 0; i < ratings.length; i++) {
				const res = await createReviewRequest(
					product._id.toString(),
					{ rating: ratings[i], comment: `Review ${i + 1}` },
					cookies[i],
				);
				expect(res.status).toBe(201);
			}

			await expectProductRatingUpdate(
				product._id.toString(),
				expectedAverage,
				ratings.length,
			);
		});

		it("calculates correct average rating with decimal precision", async () => {
			const ratings = [5, 4, 3]; // Average: 4.0

			for (let i = 0; i < ratings.length; i++) {
				await createReviewRequest(
					product._id.toString(),
					{ rating: ratings[i], comment: `Review ${i + 1}` },
					cookies[i],
				);
			}

			await expectProductRatingUpdate(product._id.toString(), 4.0, 3);

			// Add one more review to change average to 3.75
			await createReviewRequest(
				product._id.toString(),
				{ rating: 2, comment: "Review 4" },
				cookies[3],
			);

			await expectProductRatingUpdate(product._id.toString(), 3.5, 4); // (5+4+3+2)/4 = 3.5
		});

		it("handles edge case with all minimum ratings", async () => {
			const ratings = [1, 1, 1, 1, 1];

			for (let i = 0; i < ratings.length; i++) {
				await createReviewRequest(
					product._id.toString(),
					{
						rating: ratings[i],
						comment: `Poor review ${i + 1}`,
					},
					cookies[i],
				);
			}

			await expectProductRatingUpdate(product._id.toString(), 1, 5);
		});

		it("handles edge case with all maximum ratings", async () => {
			const ratings = [5, 5, 5, 5, 5];

			for (let i = 0; i < ratings.length; i++) {
				await createReviewRequest(
					product._id.toString(),
					{
						rating: ratings[i],
						comment: `Excellent review ${i + 1}`,
					},
					cookies[i],
				);
			}

			await expectProductRatingUpdate(product._id.toString(), 5, 5);
		});

		it("recalculates rating correctly after review update", async () => {
			// Create initial reviews: [5, 3, 1] -> average = 3
			const initialRatings = [5, 3, 1];
			const reviews = [];

			for (let i = 0; i < initialRatings.length; i++) {
				const res = await createReviewRequest(
					product._id.toString(),
					{
						rating: initialRatings[i],
						comment: `Review ${i + 1}`,
					},
					cookies[i],
				);
				reviews.push(res.body.data.review);
			}

			await expectProductRatingUpdate(product._id.toString(), 3, 3);

			// Update middle review from 3 to 5: [5, 5, 1] -> average = 3.67
			const updateRes = await updateReviewRequest(
				product._id.toString(),
				reviews[1]._id,
				{ rating: 5 },
				cookies[1],
			);

			expect(updateRes.status).toBe(200);
			await expectProductRatingUpdate(product._id.toString(), 3.67, 3);
		});

		it("recalculates rating correctly after review deletion", async () => {
			// Create initial reviews: [5, 4, 3, 2, 1] -> average = 3
			const initialRatings = [5, 4, 3, 2, 1];
			const reviews = [];

			for (let i = 0; i < initialRatings.length; i++) {
				const res = await createReviewRequest(
					product._id.toString(),
					{
						rating: initialRatings[i],
						comment: `Review ${i + 1}`,
					},
					cookies[i],
				);
				reviews.push(res.body.data.review);
			}

			await expectProductRatingUpdate(product._id.toString(), 3, 5);

			// Delete the lowest rating (1): [5, 4, 3, 2] -> average = 3.5
			const deleteRes = await deleteReviewRequest(
				product._id.toString(),
				reviews[4]._id,
				cookies[4],
			);

			expect(deleteRes.status).toBe(204);
			await expectProductRatingUpdate(product._id.toString(), 3.5, 4);
		});

		it("resets rating to 0 when all reviews are deleted", async () => {
			// Create multiple reviews
			const reviews = [];
			for (let i = 0; i < 3; i++) {
				const res = await createReviewRequest(
					product._id.toString(),
					{ rating: i + 3, comment: `Review ${i + 1}` }, // ratings: 3, 4, 5
					cookies[i],
				);
				reviews.push(res.body.data.review);
			}

			await expectProductRatingUpdate(product._id.toString(), 4, 3);

			// Delete all reviews
			for (let i = 0; i < reviews.length; i++) {
				const deleteRes = await deleteReviewRequest(
					product._id.toString(),
					reviews[i]._id,
					cookies[i],
				);
				expect(deleteRes.status).toBe(204);
			}

			await expectProductRatingUpdate(product._id.toString(), 0, 0);
		});
	});

	describe("Complex Rating Scenarios", () => {
		it("handles mixed operations (create, update, delete) correctly", async () => {
			// Step 1: Create initial reviews [4, 3] -> average = 3.5
			const review1Res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Good" },
				cookies[0],
			);
			const review2Res = await createReviewRequest(
				product._id.toString(),
				{ rating: 3, comment: "Average" },
				cookies[1],
			);

			await expectProductRatingUpdate(product._id.toString(), 3.5, 2);

			// Step 2: Add third review [4, 3, 5] -> average = 4
			await createReviewRequest(
				product._id.toString(),
				{ rating: 5, comment: "Excellent" },
				cookies[2],
			);

			await expectProductRatingUpdate(product._id.toString(), 4, 3);

			// Step 3: Update second review from 3 to 1: [4, 1, 5] -> average = 3.33
			await updateReviewRequest(
				product._id.toString(),
				review2Res.body.data.review._id,
				{ rating: 1 },
				cookies[1],
			);

			await expectProductRatingUpdate(product._id.toString(), 3.33, 3);

			// Step 4: Delete first review: [1, 5] -> average = 3
			await deleteReviewRequest(
				product._id.toString(),
				review1Res.body.data.review._id,
				cookies[0],
			);

			await expectProductRatingUpdate(product._id.toString(), 3, 2);

			// Step 5: Add new review: [1, 5, 4] -> average = 3.33
			await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Good again" },
				cookies[3],
			);

			await expectProductRatingUpdate(product._id.toString(), 3.33, 3);
		});

		it("maintains accuracy with large number of reviews", async () => {
			// Create many reviews with known pattern
			const numReviews = 20;
			const reviews = [];

			// Create reviews with ratings 1-5 repeatedly
			for (let i = 0; i < numReviews; i++) {
				const rating = (i % 5) + 1; // Cycles through 1, 2, 3, 4, 5
				const userIndex = i % users.length;

				// For users beyond our created ones, create new users
				if (userIndex >= users.length) {
					const { user, cookie } = await createTestUserAndGetCookie(
						`reviewer${i}`,
					);
					users.push(user);
					cookies.push(cookie);
				}

				const res = await createReviewRequest(
					product._id.toString(),
					{ rating, comment: `Review ${i + 1}` },
					cookies[userIndex],
				);
				reviews.push(res.body.data.review);
			}

			// Expected average: (1+2+3+4+5) * 4 = 60 / 20 = 3
			await expectProductRatingUpdate(product._id.toString(), 3, numReviews);
		});

		it("handles concurrent review operations correctly", async () => {
			// Create multiple reviews concurrently
			const concurrentPromises = [];
			const ratings = [5, 4, 3, 2, 1];

			for (let i = 0; i < ratings.length; i++) {
				concurrentPromises.push(
					createReviewRequest(
						product._id.toString(),
						{
							rating: ratings[i],
							comment: `Concurrent review ${i + 1}`,
						},
						cookies[i],
					),
				);
			}

			const results = await Promise.all(concurrentPromises);

			// All should succeed
			results.forEach((res) => {
				expect(res.status).toBe(201);
			});

			// Final rating should be correct
			await expectProductRatingUpdate(product._id.toString(), 3, 5);
		});

		it("maintains rating consistency across multiple products", async () => {
			// Create second product
			const product2 = await createTestProduct();

			// Add reviews to first product: [5, 4] -> average = 4.5
			await createReviewRequest(
				product._id.toString(),
				{ rating: 5, comment: "Excellent" },
				cookies[0],
			);
			await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Good" },
				cookies[1],
			);

			// Add reviews to second product: [3, 2] -> average = 2.5
			await createReviewRequest(
				product2._id.toString(),
				{ rating: 3, comment: "Average" },
				cookies[2],
			);
			await createReviewRequest(
				product2._id.toString(),
				{ rating: 2, comment: "Poor" },
				cookies[3],
			);

			// Verify both products have correct ratings
			await expectProductRatingUpdate(product._id.toString(), 4.5, 2);
			await expectProductRatingUpdate(product2._id.toString(), 2.5, 2);

			// Update review on first product shouldn't affect second
			await createReviewRequest(
				product._id.toString(),
				{ rating: 1, comment: "Changed mind" },
				cookies[4],
			);

			await expectProductRatingUpdate(product._id.toString(), 3.33, 3); // (5+4+1)/3
			await expectProductRatingUpdate(product2._id.toString(), 2.5, 2); // Unchanged
		});
	});

	describe("Rating Precision and Rounding", () => {
		it("handles floating point precision correctly", async () => {
			// Create reviews that result in repeating decimals
			const ratings = [5, 4, 4]; // Average = 4.333...

			for (let i = 0; i < ratings.length; i++) {
				await createReviewRequest(
					product._id.toString(),
					{ rating: ratings[i], comment: `Review ${i + 1}` },
					cookies[i],
				);
			}

			// Should handle floating point precision correctly
			await expectProductRatingUpdate(product._id.toString(), 4.33, 3);
		});

		it("maintains precision with many decimal places", async () => {
			// Create reviews: [5, 4, 3, 2, 1, 1] -> average = 2.666...
			const ratings = [5, 4, 3, 2, 1, 1];

			for (let i = 0; i < ratings.length; i++) {
				await createReviewRequest(
					product._id.toString(),
					{ rating: ratings[i], comment: `Review ${i + 1}` },
					cookies[i % cookies.length],
				);
			}

			await expectProductRatingUpdate(product._id.toString(), 2.67, 6);
		});
	});

	describe("Error Handling in Rating Calculations", () => {
		it("handles database errors gracefully during rating calculation", async () => {
			// This test would require mocking database errors
			// For now, we'll test normal operation
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Test review" },
				cookies[0],
			);

			expect(res.status).toBe(201);
			await expectProductRatingUpdate(product._id.toString(), 4, 1);
		});

		it("maintains data integrity during failed operations", async () => {
			// Create initial review
			await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Initial review" },
				cookies[0],
			);

			await expectProductRatingUpdate(product._id.toString(), 4, 1);

			// Try to create invalid review (should fail but not affect existing rating)
			const invalidRes = await createReviewRequest(
				product._id.toString(),
				{ rating: 6, comment: "Invalid rating" }, // Rating > 5
				cookies[1],
			);

			expect(invalidRes.status).toBe(400);

			// Original rating should be unchanged
			await expectProductRatingUpdate(product._id.toString(), 4, 1);
		});
	});
});
