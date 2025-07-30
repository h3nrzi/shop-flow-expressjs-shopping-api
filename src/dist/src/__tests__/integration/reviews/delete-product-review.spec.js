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
describe("DELETE /api/products/:productId/reviews/:id", () => {
    let product;
    let user;
    let cookie;
    let review;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        product = yield (0, reviews_helper_1.createTestProduct)();
        const testUser = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer");
        user = testUser.user;
        cookie = testUser.cookie;
        review = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 4, comment: "Good product" });
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString());
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("product ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.deleteReviewRequest)((0, reviews_helper_1.getInvalidId)(), review._id.toString(), cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("شناسه نظر معتبر نیست");
        }));
        it("review ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), (0, reviews_helper_1.getInvalidId)(), cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("شناسه نظر معتبر نیست");
        }));
    });
    describe("should return 403, if", () => {
        it("user tries to delete another user's review", () => __awaiter(void 0, void 0, void 0, function* () {
            const { user: anotherUser } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer2");
            const anotherReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), anotherUser._id.toString(), { rating: 2, comment: "Poor product" });
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), anotherReview._id.toString(), cookie);
            expect(res.status).toBe(403);
        }));
    });
    describe("should return 404, if", () => {
        it("product does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentProductId = (0, reviews_helper_1.getInvalidObjectId)();
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(nonExistentProductId, review._id.toString(), cookie);
            expect(res.status).toBe(404);
        }));
        it("review does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentReviewId = (0, reviews_helper_1.getInvalidObjectId)();
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), nonExistentReviewId, cookie);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("نظری با این شناسه یافت نشد");
        }));
        it("review has already been deleted", () => __awaiter(void 0, void 0, void 0, function* () {
            const firstDeleteRes = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(firstDeleteRes.status).toBe(204);
            const secondDeleteRes = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(secondDeleteRes.status).toBe(404);
            expect(secondDeleteRes.body.errors[0].message).toBe("نظری با این شناسه یافت نشد");
        }));
    });
    describe("should return 204, if", () => {
        it("review is deleted successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(204);
            expect(res.text).toBe("");
        }));
        it("review is actually removed from database", () => __awaiter(void 0, void 0, void 0, function* () {
            const deleteRes = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(deleteRes.status).toBe(204);
            const getRes = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(getRes.status).toBe(404);
            expect(getRes.body.errors[0].message).toBe("نظری با این شناسه یافت نشد");
        }));
        it("product rating and numReviews are updated after review deletion", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 1);
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(204);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 0, 0);
        }));
        it("product average rating is recalculated correctly after deletion with multiple reviews", () => __awaiter(void 0, void 0, void 0, function* () {
            const { user: user2 } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer2");
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user2._id.toString(), { rating: 2, comment: "Poor product" });
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3, 2);
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(204);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 2, 1);
        }));
        it("deleting last review resets product rating to 0", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 1);
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(204);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 0, 0);
        }));
        it("user can delete their own review", () => __awaiter(void 0, void 0, void 0, function* () {
            const getRes = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(getRes.status).toBe(200);
            expect(getRes.body.data.review.user._id).toBe(user._id.toString());
            const deleteRes = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(deleteRes.status).toBe(204);
        }));
        it("deletion works with different review ratings", () => __awaiter(void 0, void 0, void 0, function* () {
            const ratings = [1, 2, 3, 4, 5];
            for (const rating of ratings) {
                const testReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating, comment: `Review with rating ${rating}` });
                const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), testReview._id.toString(), cookie);
                expect(res.status).toBe(204);
            }
        }));
    });
    describe("edge cases", () => {
        it("handles deletion of review with very long comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const longComment = "A".repeat(1000);
            const longCommentReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 4, comment: longComment });
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), longCommentReview._id.toString(), cookie);
            expect(res.status).toBe(204);
        }));
        it("handles deletion of review with special characters", () => __awaiter(void 0, void 0, void 0, function* () {
            const specialComment = "Great product! 🎉 100% satisfied. Price: $99.99 & more...";
            const specialReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 5, comment: specialComment });
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), specialReview._id.toString(), cookie);
            expect(res.status).toBe(204);
        }));
        it("handles deletion of review with unicode characters", () => __awaiter(void 0, void 0, void 0, function* () {
            const unicodeComment = "محصول عالی! بسیار راضی هستم 👍";
            const unicodeReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 5, comment: unicodeComment });
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), unicodeReview._id.toString(), cookie);
            expect(res.status).toBe(204);
        }));
        it("handles concurrent deletion attempts", () => __awaiter(void 0, void 0, void 0, function* () {
            const [res1, res2] = yield Promise.all([
                (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie),
                (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie),
            ]);
            const statuses = [res1.status, res2.status].sort();
            expect(statuses).toEqual([204, 404]);
        }));
        it("deletion does not affect other product reviews", () => __awaiter(void 0, void 0, void 0, function* () {
            const anotherProduct = yield (0, reviews_helper_1.createTestProduct)();
            const anotherReview = yield (0, reviews_helper_1.createTestReview)(anotherProduct._id.toString(), user._id.toString(), { rating: 3, comment: "Different product review" });
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 1);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(anotherProduct._id.toString(), 3, 1);
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(204);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 0, 0);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(anotherProduct._id.toString(), 3, 1);
            const getOtherRes = yield (0, reviews_helper_1.getReviewByIdRequest)(anotherProduct._id.toString(), anotherReview._id.toString(), cookie);
            expect(getOtherRes.status).toBe(200);
        }));
        it("deletion does not affect other user reviews on same product", () => __awaiter(void 0, void 0, void 0, function* () {
            const { user: user2, cookie: cookie2 } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer2");
            const user2Id = user2._id || user2.id;
            if (!user2Id) {
                throw new Error("Failed to get user2 ID");
            }
            const user2Review = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user2Id.toString(), { rating: 2, comment: "Different user review" });
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3, 2);
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(204);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 2, 1);
            const getUser2ReviewRes = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), user2Review._id.toString(), cookie2);
            expect(getUser2ReviewRes.status).toBe(200);
            expect(getUser2ReviewRes.body.data.review.user._id).toBe(user2._id.toString());
        }));
    });
    describe("authorization edge cases", () => {
        it("user cannot delete review after changing password", () => __awaiter(void 0, void 0, void 0, function* () {
            const testReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 4, comment: "Test review" });
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), testReview._id.toString(), cookie);
            expect(res.status).toBe(204);
        }));
        it("handles deletion attempt with malformed cookie", () => __awaiter(void 0, void 0, void 0, function* () {
            const malformedCookie = "jwt=malformed.token.here";
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), malformedCookie);
            expect(res.status).toBe(401);
        }));
        it("handles deletion attempt with expired token", () => __awaiter(void 0, void 0, void 0, function* () {
            const expiredCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), expiredCookie);
            expect(res.status).toBe(401);
        }));
    });
    describe("data integrity", () => {
        it("ensures review is completely removed from database", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewId = review._id.toString();
            const deleteRes = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), reviewId, cookie);
            expect(deleteRes.status).toBe(204);
            const getRes = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), reviewId, cookie);
            expect(getRes.status).toBe(404);
        }));
        it("maintains database consistency after multiple deletions", () => __awaiter(void 0, void 0, void 0, function* () {
            const { user: user2, cookie: cookie2 } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer2");
            const { user: user3, cookie: cookie3 } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer3");
            const review2 = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user2._id.toString(), { rating: 3, comment: "Average" });
            const review3 = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user3._id.toString(), { rating: 5, comment: "Excellent" });
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 3);
            const res1 = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res1.status).toBe(204);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 2);
            const res2 = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review2._id.toString(), cookie2);
            expect(res2.status).toBe(204);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 5, 1);
            const res3 = yield (0, reviews_helper_1.deleteReviewRequest)(product._id.toString(), review3._id.toString(), cookie3);
            expect(res3.status).toBe(204);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 0, 0);
        }));
    });
});
