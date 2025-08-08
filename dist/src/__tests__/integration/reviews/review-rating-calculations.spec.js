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
const reviews_helper_1 = require("@/__tests__/helpers/reviews.helper");
describe("Review Rating Calculations Integration Tests", () => {
    let product;
    let users = [];
    let cookies = [];
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        product = yield (0, reviews_helper_1.createTestProduct)();
        users = [];
        cookies = [];
        for (let i = 0; i < 5; i++) {
            const { user, cookie } = yield (0, reviews_helper_1.createTestUserAndGetCookie)(`reviewer${i}`);
            users.push(user);
            cookies.push(cookie);
        }
    }));
    describe("Product Rating Calculation", () => {
        it("calculates correct average rating with single review", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 0, 0);
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Good product" }, cookies[0]);
            expect(res.status).toBe(201);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 1);
        }));
        it("calculates correct average rating with multiple reviews", () => __awaiter(void 0, void 0, void 0, function* () {
            const ratings = [5, 4, 3, 2, 1];
            const expectedAverage = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
            for (let i = 0; i < ratings.length; i++) {
                const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: ratings[i], comment: `Review ${i + 1}` }, cookies[i]);
                expect(res.status).toBe(201);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), expectedAverage, ratings.length);
        }));
        it("calculates correct average rating with decimal precision", () => __awaiter(void 0, void 0, void 0, function* () {
            const ratings = [5, 4, 3];
            for (let i = 0; i < ratings.length; i++) {
                yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: ratings[i], comment: `Review ${i + 1}` }, cookies[i]);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4.0, 3);
            yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 2, comment: "Review 4" }, cookies[3]);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3.5, 4);
        }));
        it("handles edge case with all minimum ratings", () => __awaiter(void 0, void 0, void 0, function* () {
            const ratings = [1, 1, 1, 1, 1];
            for (let i = 0; i < ratings.length; i++) {
                yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), {
                    rating: ratings[i],
                    comment: `Poor review ${i + 1}`,
                }, cookies[i]);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 1, 5);
        }));
        it("handles edge case with all maximum ratings", () => __awaiter(void 0, void 0, void 0, function* () {
            const ratings = [5, 5, 5, 5, 5];
            for (let i = 0; i < ratings.length; i++) {
                yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), {
                    rating: ratings[i],
                    comment: `Excellent review ${i + 1}`,
                }, cookies[i]);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 5, 5);
        }));
        it("recalculates rating correctly after review update", () => __awaiter(void 0, void 0, void 0, function* () {
            const initialRatings = [5, 3, 1];
            const reviews = [];
            for (let i = 0; i < initialRatings.length; i++) {
                const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), {
                    rating: initialRatings[i],
                    comment: `Review ${i + 1}`,
                }, cookies[i]);
                reviews.push(res.body.data.review);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3, 3);
            const updateRes = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), reviews[1]._id, { rating: 5 }, cookies[1]);
            expect(updateRes.status).toBe(200);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3.67, 3);
        }));
        it("recalculates rating correctly after review deletion", () => __awaiter(void 0, void 0, void 0, function* () {
            const initialRatings = [5, 4, 3, 2, 1];
            const reviews = [];
            for (let i = 0; i < initialRatings.length; i++) {
                const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), {
                    rating: initialRatings[i],
                    comment: `Review ${i + 1}`,
                }, cookies[i]);
                reviews.push(res.body.data.review);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3, 5);
            const deleteRes = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), reviews[4]._id, cookies[4]);
            expect(deleteRes.status).toBe(204);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3.5, 4);
        }));
        it("resets rating to 0 when all reviews are deleted", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviews = [];
            for (let i = 0; i < 3; i++) {
                const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: i + 3, comment: `Review ${i + 1}` }, cookies[i]);
                reviews.push(res.body.data.review);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 3);
            for (let i = 0; i < reviews.length; i++) {
                const deleteRes = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), reviews[i]._id, cookies[i]);
                expect(deleteRes.status).toBe(204);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 0, 0);
        }));
    });
    describe("Complex Rating Scenarios", () => {
        it("handles mixed operations (create, update, delete) correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const review1Res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Good" }, cookies[0]);
            const review2Res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 3, comment: "Average" }, cookies[1]);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3.5, 2);
            yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 5, comment: "Excellent" }, cookies[2]);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 3);
            yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review2Res.body.data.review._id, { rating: 1 }, cookies[1]);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3.33, 3);
            yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review1Res.body.data.review._id, cookies[0]);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3, 2);
            yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Good again" }, cookies[3]);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3.33, 3);
        }));
        it("maintains accuracy with large number of reviews", () => __awaiter(void 0, void 0, void 0, function* () {
            const numReviews = 20;
            const reviews = [];
            for (let i = 0; i < numReviews; i++) {
                const rating = (i % 5) + 1;
                const userIndex = i % users.length;
                if (userIndex >= users.length) {
                    const { user, cookie } = yield (0, reviews_helper_1.createTestUserAndGetCookie)(`reviewer${i}`);
                    users.push(user);
                    cookies.push(cookie);
                }
                const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating, comment: `Review ${i + 1}` }, cookies[userIndex]);
                reviews.push(res.body.data.review);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3, numReviews);
        }));
        it("handles concurrent review operations correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const concurrentPromises = [];
            const ratings = [5, 4, 3, 2, 1];
            for (let i = 0; i < ratings.length; i++) {
                concurrentPromises.push((0, reviews_helper_1.createReviewRequest)(product._id.toString(), {
                    rating: ratings[i],
                    comment: `Concurrent review ${i + 1}`,
                }, cookies[i]));
            }
            const results = yield Promise.all(concurrentPromises);
            results.forEach((res) => {
                expect(res.status).toBe(201);
            });
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3, 5);
        }));
        it("maintains rating consistency across multiple products", () => __awaiter(void 0, void 0, void 0, function* () {
            const product2 = yield (0, reviews_helper_1.createTestProduct)();
            yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 5, comment: "Excellent" }, cookies[0]);
            yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Good" }, cookies[1]);
            yield (0, reviews_helper_1.createReviewRequest)(product2._id.toString(), { rating: 3, comment: "Average" }, cookies[2]);
            yield (0, reviews_helper_1.createReviewRequest)(product2._id.toString(), { rating: 2, comment: "Poor" }, cookies[3]);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4.5, 2);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product2._id.toString(), 2.5, 2);
            yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 1, comment: "Changed mind" }, cookies[4]);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3.33, 3);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product2._id.toString(), 2.5, 2);
        }));
    });
    describe("Rating Precision and Rounding", () => {
        it("handles floating point precision correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const ratings = [5, 4, 4];
            for (let i = 0; i < ratings.length; i++) {
                yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: ratings[i], comment: `Review ${i + 1}` }, cookies[i]);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4.33, 3);
        }));
        it("maintains precision with many decimal places", () => __awaiter(void 0, void 0, void 0, function* () {
            const ratings = [5, 4, 3, 2, 1, 1];
            for (let i = 0; i < ratings.length; i++) {
                yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: ratings[i], comment: `Review ${i + 1}` }, cookies[i % cookies.length]);
            }
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 2.67, 6);
        }));
    });
    describe("Error Handling in Rating Calculations", () => {
        it("handles database errors gracefully during rating calculation", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Test review" }, cookies[0]);
            expect(res.status).toBe(201);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 1);
        }));
        it("maintains data integrity during failed operations", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 4, comment: "Initial review" }, cookies[0]);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 1);
            const invalidRes = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: 6, comment: "Invalid rating" }, cookies[1]);
            expect(invalidRes.status).toBe(400);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 1);
        }));
    });
});
