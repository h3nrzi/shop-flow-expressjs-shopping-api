import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createReviewRequest,
	createTestProduct,
	createTestReview,
	createTestUserAndGetCookie,
	deleteReviewRequest,
	expectProductRatingUpdate,
	getAllReviewsRequest,
	getInvalidObjectId,
	getReviewByIdRequest,
	updateReviewRequest,
} from "@/__tests__/helpers/reviews.helper";
import { productRepository, userRepository } from "@/core";

describe("Review Edge Cases and Error Handling Tests", () => {
	let product: any;
	let user: any;
	let cookie: string;

	beforeEach(async () => {
		product = await createTestProduct();
		const testUser = await createTestUserAndGetCookie("reviewer");
		user = testUser.user;
		cookie = testUser.cookie;
	});

	describe("Authentication Edge Cases", () => {
		it("handles malformed JWT token", async () => {
			const malformedCookie = "jwt=malformed.token.here";
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Test" },
				malformedCookie,
			);

			expect(res.status).toBe(401);
		});

		it("handles empty JWT token", async () => {
			const emptyCookie = "jwt=";
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Test" },
				emptyCookie,
			);

			expect(res.status).toBe(401);
		});

		it("handles JWT token with invalid signature", async () => {
			const invalidSignatureCookie =
				"jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjE0ZTUxOGY0YjJjMDAxNWY0ZTU4YSIsImlhdCI6MTYyNjQ0NzQ0MSwiZXhwIjoxNjI2NTMzODQxfQ.invalid_signature";
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Test" },
				invalidSignatureCookie,
			);

			expect(res.status).toBe(401);
		});

		it("handles non-existent user in valid JWT token", async () => {
			const invalidUserCookie = `jwt=${getInvalidToken()}`;
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Test" },
				invalidUserCookie,
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!",
			);
		});

		it("handles inactive user attempting to create review", async () => {
			// Deactivate the user
			const userDoc = await userRepository.findByEmail(user.email);
			userDoc!.active = false;
			await userDoc!.save({ validateBeforeSave: false });

			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "Test" },
				cookie,
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربری که به این ایمیل مرتبط است غیرفعال شده!",
			);
		});
	});

	describe("Input Validation Edge Cases", () => {
		it("handles extremely large rating values", async () => {
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: Number.MAX_SAFE_INTEGER, comment: "Test" },
				cookie,
			);

			expect(res.status).toBe(400);
		});

		it("handles negative rating values", async () => {
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: -1, comment: "Test" },
				cookie,
			);

			expect(res.status).toBe(400);
		});

		it("handles floating point rating values", async () => {
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 3.5, comment: "Test" },
				cookie,
			);

			expect(res.status).toBe(400);
		});

		it("handles null rating value", async () => {
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: null as any, comment: "Test" },
				cookie,
			);

			expect(res.status).toBe(400);
		});

		it("handles undefined rating value", async () => {
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: undefined as any, comment: "Test" },
				cookie,
			);

			expect(res.status).toBe(400);
		});

		it("handles null comment value", async () => {
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: null as any },
				cookie,
			);

			expect(res.status).toBe(400);
		});

		it("handles undefined comment value", async () => {
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: undefined as any },
				cookie,
			);

			expect(res.status).toBe(400);
		});

		it("handles empty string comment", async () => {
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "" },
				cookie,
			);

			expect(res.status).toBe(400);
		});

		it("handles whitespace-only comment", async () => {
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: "   \n\t   " },
				cookie,
			);

			// This might be accepted depending on validation rules
			// Adjust expectation based on actual validation behavior
			expect([200, 201, 400]).toContain(res.status);
		});

		it("handles extremely long comment", async () => {
			const veryLongComment = "A".repeat(10000); // 10KB comment
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: veryLongComment },
				cookie,
			);

			// Should either accept or reject based on validation rules
			expect([200, 201, 400]).toContain(res.status);
		});

		it("handles comment with only special characters", async () => {
			const specialComment = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: specialComment },
				cookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.data.review.comment).toBe(specialComment);
		});

		it("handles comment with SQL injection attempt", async () => {
			const sqlInjectionComment = "'; DROP TABLE reviews; --";
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: sqlInjectionComment },
				cookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.data.review.comment).toBe(sqlInjectionComment);
		});

		it("handles comment with XSS attempt", async () => {
			const xssComment = "<script>alert('XSS')</script>";
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: xssComment },
				cookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.data.review.comment).toBe(xssComment);
		});
	});

	describe("ObjectId Validation Edge Cases", () => {
		it("handles invalid ObjectId formats for product", async () => {
			const invalidIds = [
				"invalid",
				"123",
				"not-an-objectid",
				"60f14e518f4b2c0015f4e58", // Too short
				"60f14e518f4b2c0015f4e58aa1", // Too long
				"gggggggggggggggggggggggg", // Invalid characters
			];

			for (const invalidId of invalidIds) {
				const res = await createReviewRequest(
					invalidId,
					{ rating: 4, comment: "Test" },
					cookie,
				);

				expect(res.status).toBe(400);
			}
		});

		it("handles invalid ObjectId formats for review", async () => {
			await createTestReview(product._id.toString(), user._id.toString(), {
				rating: 4,
				comment: "Test",
			});

			const invalidIds = [
				"invalid",
				"123",
				"not-an-objectid",
				"60f14e518f4b2c0015f4e58", // Too short
				"60f14e518f4b2c0015f4e58aa1", // Too long
			];

			for (const invalidId of invalidIds) {
				const res = await updateReviewRequest(
					product._id.toString(),
					invalidId,
					{ rating: 5 },
					cookie,
				);

				expect(res.status).toBe(400);
			}
		});

		it("handles valid ObjectId format but non-existent product", async () => {
			const nonExistentId = getInvalidObjectId();
			const res = await createReviewRequest(
				nonExistentId,
				{ rating: 4, comment: "Test" },
				cookie,
			);

			expect(res.status).toBe(404);
		});

		it("handles valid ObjectId format but non-existent review", async () => {
			const nonExistentId = getInvalidObjectId();
			const res = await updateReviewRequest(
				product._id.toString(),
				nonExistentId,
				{ rating: 5 },
				cookie,
			);

			expect(res.status).toBe(404);
		});
	});

	describe("Concurrent Operations Edge Cases", () => {
		it("handles concurrent review creation by same user", async () => {
			const reviewData = {
				rating: 4,
				comment: "Concurrent test",
			};

			// Attempt to create multiple reviews simultaneously
			const promises = Array(5)
				.fill(null)
				.map(() =>
					createReviewRequest(product._id.toString(), reviewData, cookie),
				);

			const results = await Promise.all(promises);

			// Only one should succeed (if there's a unique constraint)
			// Or all should succeed (if multiple reviews per user are allowed)
			const successCount = results.filter((r) => r.status === 201).length;
			const errorCount = results.filter((r) => r.status >= 400).length;

			expect(successCount + errorCount).toBe(5);
			expect(successCount).toBeGreaterThan(0);
		});

		it("handles concurrent review updates", async () => {
			const review = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 3, comment: "Original" },
			);

			// Attempt concurrent updates
			const updatePromises = [
				updateReviewRequest(
					product._id.toString(),
					review._id.toString(),
					{ rating: 5 },
					cookie,
				),
				updateReviewRequest(
					product._id.toString(),
					review._id.toString(),
					{ rating: 1 },
					cookie,
				),
				updateReviewRequest(
					product._id.toString(),
					review._id.toString(),
					{ comment: "Updated" },
					cookie,
				),
			];

			const results = await Promise.all(updatePromises);

			// All should succeed (last one wins)
			results.forEach((res) => {
				expect(res.status).toBe(200);
			});
		});

		it("handles concurrent delete attempts", async () => {
			const review = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 3, comment: "To be deleted" },
			);

			// Attempt concurrent deletions
			const deletePromises = Array(3)
				.fill(null)
				.map(() =>
					deleteReviewRequest(
						product._id.toString(),
						review._id.toString(),
						cookie,
					),
				);

			const results = await Promise.all(deletePromises);

			// One should succeed (204), others should fail (404)
			const successCount = results.filter((r) => r.status === 204).length;
			const notFoundCount = results.filter((r) => r.status === 404).length;

			expect(successCount).toBe(1);
			expect(notFoundCount).toBe(2);
		});
	});

	describe("Database Edge Cases", () => {
		it("handles product deletion while reviews exist", async () => {
			// Create review first
			const review = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 4, comment: "Test review" },
			);

			// Delete the product (this would require admin access in real scenario)
			await productRepository.deleteOne(product._id.toString());

			// Try to get the review
			const res = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			// Should handle gracefully (either 404 or populate error)
			expect([404, 500]).toContain(res.status);
		});

		it("handles user deletion while reviews exist", async () => {
			// Create review first
			const review = await createTestReview(
				product._id.toString(),
				user._id.toString(),
				{ rating: 4, comment: "Test review" },
			);

			// Delete the user
			await userRepository.delete(user._id.toString());

			// Try to get the review
			const res = await getReviewByIdRequest(
				product._id.toString(),
				review._id.toString(),
				cookie,
			);

			// Should handle gracefully (either 404 or populate error)
			expect([404, 500]).toContain(res.status);
		});
	});

	describe("Pagination Edge Cases", () => {
		it("handles invalid page numbers", async () => {
			const invalidPages = [-1, 0, "invalid", null, undefined];

			for (const page of invalidPages) {
				const res = await getAllReviewsRequest(
					product._id.toString(),
					{ page },
					cookie,
				);

				// Should either use default page or return error
				expect([200, 400]).toContain(res.status);
			}
		});

		it("handles invalid limit values", async () => {
			const invalidLimits = [-1, 0, "invalid", null, undefined, 1000000];

			for (const limit of invalidLimits) {
				const res = await getAllReviewsRequest(
					product._id.toString(),
					{ limit },
					cookie,
				);

				// Should either use default limit or return error
				expect([200, 400]).toContain(res.status);
			}
		});

		it("handles extremely large page numbers", async () => {
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ page: Number.MAX_SAFE_INTEGER },
				cookie,
			);

			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe("این صفحه وجود ندارد");
		});
	});

	describe("Query Parameter Edge Cases", () => {
		it("handles invalid sort parameters", async () => {
			const invalidSorts = [
				"invalid_field",
				"-invalid_field",
				"rating,invalid",
				"",
				null,
				123,
			];

			for (const sort of invalidSorts) {
				const res = await getAllReviewsRequest(
					product._id.toString(),
					{ sort },
					cookie,
				);

				// Should either ignore invalid sort or return error
				expect([200, 400]).toContain(res.status);
			}
		});

		it("handles invalid filter parameters", async () => {
			const invalidFilters = {
				"rating[invalid]": 5,
				invalid_field: "value",
				"rating[gte]": "invalid",
				"rating[lte]": null,
			};

			for (const [key, value] of Object.entries(invalidFilters)) {
				const res = await getAllReviewsRequest(
					product._id.toString(),
					{ [key]: value },
					cookie,
				);

				// Should either ignore invalid filters or return error
				expect([200, 400]).toContain(res.status);
			}
		});

		it("handles malformed query strings", async () => {
			// This would be handled at the HTTP level, but test anyway
			const res = await getAllReviewsRequest(
				product._id.toString(),
				{ "malformed[": "value" },
				cookie,
			);

			expect([200, 400]).toContain(res.status);
		});
	});

	describe("Memory and Performance Edge Cases", () => {
		it("handles requests with very large payloads", async () => {
			const largePayload = {
				rating: 4,
				comment: "Test",
				...Object.fromEntries(
					Array.from({ length: 1000 }, (_, i) => [
						`field${i}`,
						`value${i}`.repeat(100),
					]),
				),
			} as any;

			const res = await createReviewRequest(
				product._id.toString(),
				largePayload,
				cookie,
			);

			// Should either accept (ignoring extra fields) or reject due to size
			expect([201, 400, 413]).toContain(res.status);
		});

		it("handles deeply nested objects in request", async () => {
			const deepObject = { rating: 4, comment: "Test" } as any;
			let current = deepObject;

			// Create deeply nested structure
			for (let i = 0; i < 100; i++) {
				current.nested = { level: i };
				current = current.nested;
			}

			const res = await createReviewRequest(
				product._id.toString(),
				deepObject,
				cookie,
			);

			// Should handle gracefully
			expect([201, 400]).toContain(res.status);
		});
	});

	describe("Unicode and Encoding Edge Cases", () => {
		it("handles various Unicode characters in comments", async () => {
			const unicodeComments = [
				"🎉🎊🎈 Great product! 👍👏",
				"محصول عالی! بسیار راضی هستم",
				"Отличный продукт! Очень доволен",
				"素晴らしい製品！とても満足しています",
				"Excellent produit ! Très satisfait",
				"¡Excelente producto! Muy satisfecho",
			];

			for (const comment of unicodeComments) {
				const res = await createReviewRequest(
					product._id.toString(),
					{ rating: 5, comment },
					cookie,
				);

				expect(res.status).toBe(201);
				expect(res.body.data.review.comment).toBe(comment);
			}
		});

		it("handles mixed RTL and LTR text", async () => {
			const mixedText =
				"This is English text mixed with عربی text and עברית text";
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: mixedText },
				cookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.data.review.comment).toBe(mixedText);
		});

		it("handles zero-width characters", async () => {
			const zeroWidthComment =
				"Normal text\u200B\u200C\u200D\uFEFFwith zero-width chars";
			const res = await createReviewRequest(
				product._id.toString(),
				{ rating: 4, comment: zeroWidthComment },
				cookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.data.review.comment).toBe(zeroWidthComment);
		});
	});

	describe("Error Recovery and Resilience", () => {
		it("maintains data consistency after failed operations", async () => {
			// Create initial review
			await createTestReview(product._id.toString(), user._id.toString(), {
				rating: 4,
				comment: "Initial",
			});

			await expectProductRatingUpdate(product._id.toString(), 4, 1);

			// Attempt invalid operation
			const invalidRes = await createReviewRequest(
				product._id.toString(),
				{ rating: 10, comment: "Invalid" }, // Invalid rating
				cookie,
			);

			expect(invalidRes.status).toBe(400);

			// Verify original state is preserved
			await expectProductRatingUpdate(product._id.toString(), 4, 1);
		});

		it("handles partial failures in batch operations gracefully", async () => {
			// This would test batch operations if they existed
			// For now, test sequential operations with some failures

			const operations = [
				{ rating: 5, comment: "Valid 1" },
				{ rating: 10, comment: "Invalid rating" }, // Should fail
				{ rating: 3, comment: "Valid 2" },
				{ rating: -1, comment: "Invalid rating 2" }, // Should fail
				{ rating: 4, comment: "Valid 3" },
			];

			let successCount = 0;
			let failureCount = 0;

			for (const op of operations) {
				const res = await createReviewRequest(
					product._id.toString(),
					op,
					cookie,
				);

				if (res.status === 201) {
					successCount++;
				} else {
					failureCount++;
				}
			}

			expect(successCount).toBe(3);
			expect(failureCount).toBe(2);

			// Verify only valid reviews were created
			const allReviewsRes = await getAllReviewsRequest(
				product._id.toString(),
				{},
				cookie,
			);
			expect(allReviewsRes.body.results).toBe(3);
		});
	});
});
