"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_helper_1 = require("@/__tests__/helpers/auth.helper");
const reviews_helper_1 = require("@/__tests__/helpers/reviews.helper");
const core_1 = require("@/core");
describe("Review Edge Cases and Error Handling Tests", () => {
    let product;
    let user;
    let cookie;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        product = yield (0, reviews_helper_1.createTestProduct)();
        const testUser = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer");
        user = testUser.user;
        cookie = testUser.cookie;
    }));
    describe("Authentication Edge Cases", () => {
        it("handles malformed JWT token", () => __awaiter(void 0, void 0, void 0, function* () {
            const malformedCookie = "jwt=malformed.token.here";
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Test" }, malformedCookie);
            expect(res.status).toBe(401);
        }));
        it("handles empty JWT token", () => __awaiter(void 0, void 0, void 0, function* () {
            const emptyCookie = "jwt=";
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Test" }, emptyCookie);
            expect(res.status).toBe(401);
        }));
        it("handles JWT token with invalid signature", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidSignatureCookie = "jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjE0ZTUxOGY0YjJjMDAxNWY0ZTU4YSIsImlhdCI6MTYyNjQ0NzQ0MSwiZXhwIjoxNjI2NTMzODQxfQ.invalid_signature";
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Test" }, invalidSignatureCookie);
            expect(res.status).toBe(401);
        }));
        it("handles non-existent user in valid JWT token", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidUserCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Test" }, invalidUserCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
        it("handles inactive user attempting to create review", () => __awaiter(void 0, void 0, void 0, function* () {
            const userDoc = yield core_1.userRepository.findByEmail(user.email);
            userDoc.active = false;
            yield userDoc.save({ validateBeforeSave: false });
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Test" }, cookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است غیرفعال شده!");
        }));
    });
    describe("Input Validation Edge Cases", () => {
        it("handles extremely large rating values", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: Number.MAX_SAFE_INTEGER, comment: "Test" }, cookie);
            expect(res.status).toBe(400);
        }));
        it("handles negative rating values", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: -1, comment: "Test" }, cookie);
            expect(res.status).toBe(400);
        }));
        it("handles floating point rating values", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 3.5, comment: "Test" }, cookie);
            expect(res.status).toBe(400);
        }));
        it("handles null rating value", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: null, comment: "Test" }, cookie);
            expect(res.status).toBe(400);
        }));
        it("handles undefined rating value", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: undefined, comment: "Test" }, cookie);
            expect(res.status).toBe(400);
        }));
        it("handles null comment value", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: null }, cookie);
            expect(res.status).toBe(400);
        }));
        it("handles undefined comment value", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: undefined }, cookie);
            expect(res.status).toBe(400);
        }));
        it("handles empty string comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "" }, cookie);
            expect(res.status).toBe(400);
        }));
        it("handles whitespace-only comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "   \n\t   " }, cookie);
            expect([200, 201, 400]).toContain(res.status);
        }));
        it("handles extremely long comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const veryLongComment = "A".repeat(10000);
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: veryLongComment }, cookie);
            expect([200, 201, 400]).toContain(res.status);
        }));
        it("handles comment with only special characters", () => __awaiter(void 0, void 0, void 0, function* () {
            const specialComment = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: specialComment }, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.comment).toBe(specialComment);
        }));
        it("handles comment with SQL injection attempt", () => __awaiter(void 0, void 0, void 0, function* () {
            const sqlInjectionComment = "'; DROP TABLE reviews; --";
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: sqlInjectionComment }, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.comment).toBe(sqlInjectionComment);
        }));
        it("handles comment with XSS attempt", () => __awaiter(void 0, void 0, void 0, function* () {
            const xssComment = "<script>alert('XSS')</script>";
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: xssComment }, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.comment).toBe(xssComment);
        }));
    });
    describe("ObjectId Validation Edge Cases", () => {
        it("handles invalid ObjectId formats for product", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidIds = [
                "invalid",
                "123",
                "not-an-objectid",
                "60f14e518f4b2c0015f4e58",
                "60f14e518f4b2c0015f4e58aa1",
                "gggggggggggggggggggggggg",
            ];
            for (const invalidId of invalidIds) {
                const res = yield (0, reviews_helper_1.createReviewRequest)(invalidId, { rating: 4, comment: "Test" }, cookie);
                expect(res.status).toBe(400);
            }
        }));
        it("handles invalid ObjectId formats for review", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 4, comment: "Test" });
            const invalidIds = [
                "invalid",
                "123",
                "not-an-objectid",
                "60f14e518f4b2c0015f4e58",
                "60f14e518f4b2c0015f4e58aa1",
            ];
            for (const invalidId of invalidIds) {
                const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), invalidId, { rating: 5 }, cookie);
                expect(res.status).toBe(400);
            }
        }));
        it("handles valid ObjectId format but non-existent product", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = (0, reviews_helper_1.getInvalidObjectId)();
            const res = yield (0, reviews_helper_1.createReviewRequest)(nonExistentId, { rating: 4, comment: "Test" }, cookie);
            expect(res.status).toBe(404);
        }));
        it("handles valid ObjectId format but non-existent review", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = (0, reviews_helper_1.getInvalidObjectId)();
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), nonExistentId, { rating: 5 }, cookie);
            expect(res.status).toBe(404);
        }));
    });
    describe("Concurrent Operations Edge Cases", () => {
        it("handles concurrent review creation by same user", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = {
                rating: 4,
                comment: "Concurrent test",
            };
            const promises = Array(5)
                .fill(null)
                .map(() => (0, reviews_helper_1.createReviewRequest)(product._id.toString(), reviewData, cookie));
            const results = yield Promise.all(promises);
            const successCount = results.filter(r => r.status === 201).length;
            const errorCount = results.filter(r => r.status >= 400).length;
            expect(successCount + errorCount).toBe(5);
            expect(successCount).toBeGreaterThan(0);
        }));
        it("handles concurrent review updates", () => __awaiter(void 0, void 0, void 0, function* () {
            const review = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 3, comment: "Original" });
            const updatePromises = [
                (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), { rating: 5 }, cookie),
                (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), { rating: 1 }, cookie),
                (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), { comment: "Updated" }, cookie),
            ];
            const results = yield Promise.all(updatePromises);
            results.forEach(res => {
                expect(res.status).toBe(200);
            });
        }));
        it("handles concurrent delete attempts", () => __awaiter(void 0, void 0, void 0, function* () {
            const review = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 3, comment: "To be deleted" });
            const deletePromises = Array(3)
                .fill(null)
                .map(() => (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie));
            const results = yield Promise.all(deletePromises);
            const successCount = results.filter(r => r.status === 204).length;
            const notFoundCount = results.filter(r => r.status === 404).length;
            expect(successCount).toBe(1);
            expect(notFoundCount).toBe(2);
        }));
    });
    describe("Database Edge Cases", () => {
        it("handles product deletion while reviews exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const review = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 4, comment: "Test review" });
            yield core_1.productRepository.deleteOne(product._id.toString());
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect([404, 500]).toContain(res.status);
        }));
        it("handles user deletion while reviews exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const review = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 4, comment: "Test review" });
            yield core_1.userRepository.delete(user._id.toString());
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect([404, 500]).toContain(res.status);
        }));
    });
    describe("Pagination Edge Cases", () => {
        it("handles invalid page numbers", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPages = [-1, 0, "invalid", null, undefined];
            for (const page of invalidPages) {
                const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { page }, cookie);
                expect([200, 400]).toContain(res.status);
            }
        }));
        it("handles invalid limit values", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidLimits = [
                -1,
                0,
                "invalid",
                null,
                undefined,
                1000000,
            ];
            for (const limit of invalidLimits) {
                const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { limit }, cookie);
                expect([200, 400]).toContain(res.status);
            }
        }));
        it("handles extremely large page numbers", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { page: Number.MAX_SAFE_INTEGER }, cookie);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("این صفحه وجود ندارد");
        }));
    });
    describe("Query Parameter Edge Cases", () => {
        it("handles invalid sort parameters", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidSorts = [
                "invalid_field",
                "-invalid_field",
                "rating,invalid",
                "",
                null,
                123,
            ];
            for (const sort of invalidSorts) {
                const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { sort }, cookie);
                expect([200, 400]).toContain(res.status);
            }
        }));
        it("handles invalid filter parameters", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidFilters = {
                "rating[invalid]": 5,
                invalid_field: "value",
                "rating[gte]": "invalid",
                "rating[lte]": null,
            };
            for (const [key, value] of Object.entries(invalidFilters)) {
                const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { [key]: value }, cookie);
                expect([200, 400]).toContain(res.status);
            }
        }));
        it("handles malformed query strings", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { "malformed[": "value" }, cookie);
            expect([200, 400]).toContain(res.status);
        }));
    });
    describe("Memory and Performance Edge Cases", () => {
        it("handles requests with very large payloads", () => __awaiter(void 0, void 0, void 0, function* () {
            const largePayload = Object.assign({ rating: 4, comment: "Test" }, Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [
                `field${i}`,
                `value${i}`.repeat(100),
            ])));
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), largePayload, cookie);
            expect([201, 400, 413]).toContain(res.status);
        }));
        it("handles deeply nested objects in request", () => __awaiter(void 0, void 0, void 0, function* () {
            const deepObject = { rating: 4, comment: "Test" };
            let current = deepObject;
            for (let i = 0; i < 100; i++) {
                current.nested = { level: i };
                current = current.nested;
            }
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), deepObject, cookie);
            expect([201, 400]).toContain(res.status);
        }));
    });
    describe("Unicode and Encoding Edge Cases", () => {
        it("handles various Unicode characters in comments", () => __awaiter(void 0, void 0, void 0, function* () {
            const unicodeComments = [
                "🎉🎊🎈 Great product! 👍👏",
                "محصول عالی! بسیار راضی هستم",
                "Отличный продукт! Очень доволен",
                "素晴らしい製品！とても満足しています",
                "Excellent produit ! Très satisfait",
                "¡Excelente producto! Muy satisfecho",
            ];
            for (const comment of unicodeComments) {
                const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 5, comment }, cookie);
                expect(res.status).toBe(201);
                expect(res.body.data.review.comment).toBe(comment);
            }
        }));
        it("handles mixed RTL and LTR text", () => __awaiter(void 0, void 0, void 0, function* () {
            const mixedText = "This is English text mixed with عربی text and עברית text";
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: mixedText }, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.comment).toBe(mixedText);
        }));
        it("handles zero-width characters", () => __awaiter(void 0, void 0, void 0, function* () {
            const zeroWidthComment = "Normal text\u200B\u200C\u200D\uFEFFwith zero-width chars";
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: zeroWidthComment }, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.comment).toBe(zeroWidthComment);
        }));
    });
    describe("Error Recovery and Resilience", () => {
        it("maintains data consistency after failed operations", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 4, comment: "Initial" });
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 1);
            const invalidRes = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 10, comment: "Invalid" }, cookie);
            expect(invalidRes.status).toBe(400);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 1);
        }));
        it("handles partial failures in batch operations gracefully", () => __awaiter(void 0, void 0, void 0, function* () {
            const operations = [
                { rating: 5, comment: "Valid 1" },
                { rating: 10, comment: "Invalid rating" },
                { rating: 3, comment: "Valid 2" },
                { rating: -1, comment: "Invalid rating 2" },
                { rating: 4, comment: "Valid 3" },
            ];
            let successCount = 0;
            let failureCount = 0;
            for (const op of operations) {
                const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), op, cookie);
                if (res.status === 201) {
                    successCount++;
                }
                else {
                    failureCount++;
                }
            }
            expect(successCount).toBe(3);
            expect(failureCount).toBe(2);
            const allReviewsRes = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {}, cookie);
            expect(allReviewsRes.body.results).toBe(3);
        }));
    });
});
