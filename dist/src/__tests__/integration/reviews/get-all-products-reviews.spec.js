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
describe("GET /api/products/:productId/reviews", () => {
    let product;
    let user;
    let cookie;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        product = yield (0, reviews_helper_1.createTestProduct)();
        const testUser = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer");
        user = testUser.user;
        cookie = testUser.cookie;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString());
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {}, invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("product ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)((0, reviews_helper_1.getInvalidId)(), {}, cookie);
            expect(res.status).toBe(400);
        }));
    });
    describe("should return 404, if", () => {
        it("product does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentProductId = (0, reviews_helper_1.getInvalidObjectId)();
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(nonExistentProductId, {}, cookie);
            expect(res.status).toBe(404);
        }));
        it("page number exceeds total pages", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.createMultipleTestReviews)(product._id.toString(), 2);
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { page: 10, limit: 5 }, cookie);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("این صفحه وجود ندارد");
        }));
    });
    describe("should return 200, if", () => {
        it("returns empty array when product has no reviews", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {}, cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.results).toBe(0);
            expect(res.body.data.reviews).toEqual([]);
            (0, reviews_helper_1.expectValidPaginationResponse)(res.body.pagination);
        }));
        it("returns all reviews for a product", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.createMultipleTestReviews)(product._id.toString(), 3);
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {}, cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.results).toBe(3);
            expect(res.body.data.reviews).toHaveLength(3);
            (0, reviews_helper_1.expectValidPaginationResponse)(res.body.pagination);
            res.body.data.reviews.forEach((review) => {
                (0, reviews_helper_1.expectValidReviewResponse)(review);
                expect(review.product._id).toBe(product._id.toString());
            });
        }));
        it("returns reviews with populated user and product data", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString());
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {}, cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.reviews).toHaveLength(1);
            const review = res.body.data.reviews[0];
            expect(review.user).toHaveProperty("_id");
            expect(review.user).toHaveProperty("name");
            expect(review.user).toHaveProperty("email");
            expect(review.product).toHaveProperty("_id");
            expect(review.product).toHaveProperty("name");
            expect(review.product).toHaveProperty("price");
        }));
    });
    describe("pagination", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.createMultipleTestReviews)(product._id.toString(), 10);
        }));
        it("returns first page with default limit", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {}, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBeLessThanOrEqual(10);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.totalResults).toBe(10);
        }));
        it("returns specific page with custom limit", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { page: 2, limit: 3 }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(3);
            expect(res.body.pagination.page).toBe(2);
            expect(res.body.pagination.limit).toBe(3);
            expect(res.body.pagination.totalResults).toBe(10);
            expect(res.body.pagination.totalPages).toBe(4);
        }));
        it("returns last page correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { page: 4, limit: 3 }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(1);
            expect(res.body.pagination.page).toBe(4);
            expect(res.body.pagination.hasNextPage).toBe(false);
            expect(res.body.pagination.hasPrevPage).toBe(true);
        }));
        it("handles large limit values", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { limit: 100 }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(10);
            expect(res.body.pagination.totalPages).toBe(1);
        }));
    });
    describe("query parameters", () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), {
                rating: 5,
                comment: "Excellent product",
            });
            const { user: user2 } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer2");
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user2._id.toString(), {
                rating: 3,
                comment: "Average product",
            });
            const { user: user3 } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer3");
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user3._id.toString(), {
                rating: 1,
                comment: "Poor product",
            });
        }));
        it("filters reviews by rating", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { rating: 5 }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(1);
            expect(res.body.data.reviews[0].rating).toBe(5);
        }));
        it("filters reviews by rating range", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { "rating[gte]": 3 }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(2);
            res.body.data.reviews.forEach((review) => {
                expect(review.rating).toBeGreaterThanOrEqual(3);
            });
        }));
        it("sorts reviews by rating descending", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { sort: "-rating" }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(3);
            const ratings = res.body.data.reviews.map((review) => review.rating);
            expect(ratings).toEqual([5, 3, 1]);
        }));
        it("sorts reviews by rating ascending", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { sort: "rating" }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(3);
            const ratings = res.body.data.reviews.map((review) => review.rating);
            expect(ratings).toEqual([1, 3, 5]);
        }));
        it("sorts reviews by creation date", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { sort: "-createdAt" }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(3);
            const dates = res.body.data.reviews.map((review) => new Date(review.createdAt));
            for (let i = 0; i < dates.length - 1; i++) {
                expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
            }
        }));
        it("limits fields in response", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { fields: "rating,comment" }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(3);
            res.body.data.reviews.forEach((review) => {
                expect(review).toHaveProperty("rating");
                expect(review).toHaveProperty("comment");
                expect(review).toHaveProperty("_id");
            });
        }));
        it("combines multiple query parameters", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {
                "rating[gte]": 3,
                sort: "-rating",
                limit: 1,
                page: 1,
            }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(1);
            expect(res.body.data.reviews[0].rating).toBe(5);
            expect(res.body.pagination.totalResults).toBe(2);
        }));
    });
    describe("edge cases", () => {
        it("handles invalid query parameters gracefully", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { page: "invalid", limit: "abc" }, cookie);
            expect(res.status).toBe(200);
        }));
        it("handles negative page numbers", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { page: -1 }, cookie);
            expect(res.status).toBe(200);
            expect(res.body.pagination.page).toBe(1);
        }));
        it("handles zero limit", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), { limit: 0 }, cookie);
            expect(res.status).toBe(200);
        }));
        it("returns reviews only for specified product", () => __awaiter(void 0, void 0, void 0, function* () {
            const anotherProduct = yield (0, reviews_helper_1.createTestProduct)();
            yield (0, reviews_helper_1.createTestReview)(anotherProduct._id.toString(), user._id.toString(), {
                rating: 2,
                comment: "Different product review",
            });
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), {
                rating: 4,
                comment: "Original product review",
            });
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {}, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(1);
            expect(res.body.data.reviews[0].product._id).toBe(product._id.toString());
            expect(res.body.data.reviews[0].comment).toBe("Original product review");
        }));
    });
});
