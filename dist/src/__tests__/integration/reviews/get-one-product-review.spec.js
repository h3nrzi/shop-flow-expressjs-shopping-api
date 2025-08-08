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
describe("GET /api/products/:productId/reviews/:id", () => {
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
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString());
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("product ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)((0, reviews_helper_1.getInvalidId)(), review._id.toString(), cookie);
            expect(res.status).toBe(400);
        }));
        it("review ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), (0, reviews_helper_1.getInvalidId)(), cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("شناسه نظر معتبر نیست");
        }));
    });
    describe("should return 404, if", () => {
        it("product does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentProductId = (0, reviews_helper_1.getInvalidObjectId)();
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(nonExistentProductId, review._id.toString(), cookie);
            expect(res.status).toBe(404);
        }));
        it("review does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentReviewId = (0, reviews_helper_1.getInvalidObjectId)();
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), nonExistentReviewId, cookie);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("نظری با این شناسه یافت نشد");
        }));
        it("review exists but belongs to different product", () => __awaiter(void 0, void 0, void 0, function* () {
            const anotherProduct = yield (0, reviews_helper_1.createTestProduct)();
            const anotherReview = yield (0, reviews_helper_1.createTestReview)(anotherProduct._id.toString(), user._id.toString(), { rating: 3, comment: "Different product review" });
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), anotherReview._id.toString(), cookie);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("نظری با این شناسه یافت نشد");
        }));
    });
    describe("should return 200, if", () => {
        it("review is found successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data).toHaveProperty("review");
            const returnedReview = res.body.data.review;
            (0, reviews_helper_1.expectValidReviewResponse)(returnedReview, {
                rating: 4,
                comment: "Good product",
            });
            expect(returnedReview._id).toBe(review._id.toString());
        }));
        it("review includes populated user data", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(200);
            const returnedReview = res.body.data.review;
            expect(returnedReview.user).toHaveProperty("_id");
            expect(returnedReview.user).toHaveProperty("name");
            expect(returnedReview.user).toHaveProperty("email");
            expect(returnedReview.user._id).toBe(user._id.toString());
        }));
        it("review includes populated product data", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(200);
            const returnedReview = res.body.data.review;
            expect(returnedReview.product).toHaveProperty("_id");
            expect(returnedReview.product).toHaveProperty("name");
            expect(returnedReview.product).toHaveProperty("price");
            expect(returnedReview.product).toHaveProperty("description");
            expect(returnedReview.product._id).toBe(product._id.toString());
        }));
        it("returns review with all expected fields", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(200);
            const returnedReview = res.body.data.review;
            expect(returnedReview).toHaveProperty("_id");
            expect(returnedReview).toHaveProperty("rating");
            expect(returnedReview).toHaveProperty("comment");
            expect(returnedReview).toHaveProperty("user");
            expect(returnedReview).toHaveProperty("product");
            expect(returnedReview).toHaveProperty("createdAt");
            expect(returnedReview).toHaveProperty("updatedAt");
            expect(typeof returnedReview._id).toBe("string");
            expect(typeof returnedReview.rating).toBe("number");
            expect(typeof returnedReview.comment).toBe("string");
            expect(typeof returnedReview.user).toBe("object");
            expect(typeof returnedReview.product).toBe("object");
            expect(typeof returnedReview.createdAt).toBe("string");
            expect(typeof returnedReview.updatedAt).toBe("string");
        }));
        it("returns review with correct rating range", () => __awaiter(void 0, void 0, void 0, function* () {
            const minRatingReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 1, comment: "Poor product" });
            const res1 = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), minRatingReview._id.toString(), cookie);
            expect(res1.status).toBe(200);
            expect(res1.body.data.review.rating).toBe(1);
            const maxRatingReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 5, comment: "Excellent product" });
            const res2 = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), maxRatingReview._id.toString(), cookie);
            expect(res2.status).toBe(200);
            expect(res2.body.data.review.rating).toBe(5);
        }));
        it("returns review created by different user", () => __awaiter(void 0, void 0, void 0, function* () {
            const { user: anotherUser } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer2");
            const anotherReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), anotherUser._id.toString(), { rating: 3, comment: "Average product" });
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), anotherReview._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review._id).toBe(anotherReview._id.toString());
            expect(res.body.data.review.user._id).toBe(anotherUser._id.toString());
            expect(res.body.data.review.rating).toBe(3);
            expect(res.body.data.review.comment).toBe("Average product");
        }));
    });
    describe("edge cases", () => {
        it("handles review with very long comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const longComment = "A".repeat(1000);
            const longCommentReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 4, comment: longComment });
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), longCommentReview._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review.comment).toBe(longComment);
            expect(res.body.data.review.comment.length).toBe(1000);
        }));
        it("handles review with special characters in comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const specialComment = "Great product! 🎉 100% satisfied. Price: $99.99 & more...";
            const specialReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 5, comment: specialComment });
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), specialReview._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review.comment).toBe(specialComment);
        }));
        it("handles review with unicode characters", () => __awaiter(void 0, void 0, void 0, function* () {
            const unicodeComment = "محصول عالی! بسیار راضی هستم 👍";
            const unicodeReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 5, comment: unicodeComment });
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), unicodeReview._id.toString(), cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review.comment).toBe(unicodeComment);
        }));
        it("returns consistent data structure regardless of review content", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviews = [
                { rating: 1, comment: "Bad" },
                {
                    rating: 3,
                    comment: "Average product with moderate length comment",
                },
                { rating: 5, comment: "Excellent! " + "A".repeat(500) },
            ];
            for (const reviewData of reviews) {
                const testReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), reviewData);
                const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), testReview._id.toString(), cookie);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty("status", "success");
                expect(res.body).toHaveProperty("data");
                expect(res.body.data).toHaveProperty("review");
                (0, reviews_helper_1.expectValidReviewResponse)(res.body.data.review, reviewData);
            }
        }));
        it("handles concurrent requests for same review", () => __awaiter(void 0, void 0, void 0, function* () {
            const promises = Array(5)
                .fill(null)
                .map(() => (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie));
            const responses = yield Promise.all(promises);
            responses.forEach((res) => {
                expect(res.status).toBe(200);
                expect(res.body.data.review._id).toBe(review._id.toString());
            });
        }));
    });
    describe("data consistency", () => {
        it("returns same data when accessed multiple times", () => __awaiter(void 0, void 0, void 0, function* () {
            const res1 = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            const res2 = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res1.status).toBe(200);
            expect(res2.status).toBe(200);
            expect(res1.body.data.review._id).toBe(res2.body.data.review._id);
            expect(res1.body.data.review.rating).toBe(res2.body.data.review.rating);
            expect(res1.body.data.review.comment).toBe(res2.body.data.review.comment);
            expect(res1.body.data.review.createdAt).toBe(res2.body.data.review.createdAt);
        }));
        it("returns review data that matches database record", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getReviewByIdRequest)(product._id.toString(), review._id.toString(), cookie);
            expect(res.status).toBe(200);
            const returnedReview = res.body.data.review;
            expect(returnedReview._id).toBe(review._id.toString());
            expect(returnedReview.rating).toBe(review.rating);
            expect(returnedReview.comment).toBe(review.comment);
            expect(returnedReview.user._id).toBe(review.user.toString());
            expect(returnedReview.product._id).toBe(review.product.toString());
        }));
    });
});
