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
describe("Review Middleware Integration Tests", () => {
    let product;
    let user;
    let cookie;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        product = yield (0, reviews_helper_1.createTestProduct)();
        const testUser = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer");
        user = testUser.user;
        cookie = testUser.cookie;
    }));
    describe("beforeGetAll Middleware", () => {
        it("sets initialFilter with productId from URL params", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 4, comment: "Product review" });
            const anotherProduct = yield (0, reviews_helper_1.createTestProduct)();
            yield (0, reviews_helper_1.createTestReview)(anotherProduct._id.toString(), user._id.toString(), { rating: 3, comment: "Another product review" });
            const res = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {}, cookie);
            expect(res.status).toBe(200);
            expect(res.body.results).toBe(1);
            expect(res.body.data.reviews[0].product._id).toBe(product._id.toString());
            expect(res.body.data.reviews[0].comment).toBe("Product review");
        }));
        it("correctly filters reviews by product when multiple products exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const products = [product];
            const expectedReviewCounts = [3, 2, 1];
            for (let i = 1; i < 3; i++) {
                products.push(yield (0, reviews_helper_1.createTestProduct)());
            }
            for (let i = 0; i < products.length; i++) {
                for (let j = 0; j < expectedReviewCounts[i]; j++) {
                    const { user: reviewUser } = yield (0, reviews_helper_1.createTestUserAndGetCookie)(`user${i}_${j}`);
                    yield (0, reviews_helper_1.createTestReview)(products[i]._id.toString(), reviewUser._id.toString(), {
                        rating: j + 3,
                        comment: `Review ${j + 1} for product ${i + 1}`,
                    });
                }
            }
            for (let i = 0; i < products.length; i++) {
                const res = yield (0, reviews_helper_1.getAllReviewsRequest)(products[i]._id.toString(), {}, cookie);
                expect(res.status).toBe(200);
                expect(res.body.results).toBe(expectedReviewCounts[i]);
                res.body.data.reviews.forEach((review) => {
                    expect(review.product._id).toBe(products[i]._id.toString());
                });
            }
        }));
    });
    describe("beforeCreate Middleware", () => {
        it("sets user from authenticated user (req.user._id)", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = {
                rating: 4,
                comment: "Great product",
            };
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), reviewData, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.user._id).toBe(user._id.toString());
        }));
        it("sets product from URL params (req.params.productId)", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = {
                rating: 4,
                comment: "Great product",
            };
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), reviewData, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.product._id).toBe(product._id.toString());
        }));
        it("overrides user field if provided in body with authenticated user", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = {
                rating: 4,
                comment: "Great product",
                user: (0, reviews_helper_1.getInvalidObjectId)(),
            };
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), reviewData, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.user._id).toBe(user._id.toString());
            expect(res.body.data.review.user._id).not.toBe(reviewData.user);
        }));
        it("overrides product field if provided in body with URL param", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = {
                rating: 4,
                comment: "Great product",
                product: (0, reviews_helper_1.getInvalidObjectId)(),
            };
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), reviewData, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.product._id).toBe(product._id.toString());
            expect(res.body.data.review.product._id).not.toBe(reviewData.product);
        }));
        it("preserves rating and comment from request body", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = {
                rating: 5,
                comment: "Excellent product with detailed review",
            };
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), reviewData, cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.rating).toBe(reviewData.rating);
            expect(res.body.data.review.comment).toBe(reviewData.comment);
        }));
        it("creates clean request body with only necessary fields", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = {
                rating: 4,
                comment: "Great product",
                extraField: "should be ignored",
                anotherField: 123,
                user: (0, reviews_helper_1.getInvalidObjectId)(),
                product: (0, reviews_helper_1.getInvalidObjectId)(),
            };
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), reviewData, cookie);
            expect(res.status).toBe(201);
            const review = res.body.data.review;
            expect(review.rating).toBe(4);
            expect(review.comment).toBe("Great product");
            expect(review.user._id).toBe(user._id.toString());
            expect(review.product._id).toBe(product._id.toString());
            expect(review).not.toHaveProperty("extraField");
            expect(review).not.toHaveProperty("anotherField");
        }));
    });
    describe("beforeUpdate Middleware", () => {
        let review;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            review = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 3, comment: "Original comment" });
        }));
        it("filters update body to only include rating and comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 5,
                comment: "Updated comment",
                user: (0, reviews_helper_1.getInvalidObjectId)(),
                product: (0, reviews_helper_1.getInvalidObjectId)(),
                extraField: "should be ignored",
                _id: (0, reviews_helper_1.getInvalidObjectId)(),
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.rating).toBe(5);
            expect(updatedReview.comment).toBe("Updated comment");
            expect(updatedReview.user._id).toBe(user._id.toString());
            expect(updatedReview.product._id).toBe(product._id.toString());
            expect(updatedReview._id).toBe(review._id.toString());
            expect(updatedReview).not.toHaveProperty("extraField");
        }));
        it("allows partial updates with only rating", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 1,
                extraField: "should be ignored",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.rating).toBe(1);
            expect(updatedReview.comment).toBe("Original comment");
        }));
        it("allows partial updates with only comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                comment: "Only comment updated",
                extraField: "should be ignored",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.rating).toBe(3);
            expect(updatedReview.comment).toBe("Only comment updated");
        }));
        it("handles empty update object", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                extraField: "should be ignored",
                anotherField: 123,
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.rating).toBe(3);
            expect(updatedReview.comment).toBe("Original comment");
        }));
    });
    describe("Middleware Integration with Authentication", () => {
        it("beforeCreate works correctly with authenticated user", () => __awaiter(void 0, void 0, void 0, function* () {
            const { user: anotherUser, cookie: anotherCookie } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer2");
            const reviewData = {
                rating: 4,
                comment: "Review by second user",
            };
            const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), reviewData, anotherCookie);
            expect(res.status).toBe(201);
            expect(res.body.data.review.user._id).toBe(anotherUser._id.toString());
            expect(res.body.data.review.user._id).not.toBe(user._id.toString());
        }));
        it("middleware respects authentication context for different users", () => __awaiter(void 0, void 0, void 0, function* () {
            const users = [];
            const cookies = [];
            for (let i = 0; i < 3; i++) {
                const { user: testUser, cookie: testCookie } = yield (0, reviews_helper_1.createTestUserAndGetCookie)(`reviewer${i}`);
                users.push(testUser);
                cookies.push(testCookie);
            }
            for (let i = 0; i < users.length; i++) {
                const res = yield (0, reviews_helper_1.createReviewRequest)(product._id.toString(), { rating: i + 3, comment: `Review by user ${i}` }, cookies[i]);
                expect(res.status).toBe(201);
                expect(res.body.data.review.user._id).toBe(users[i]._id.toString());
            }
            const allReviewsRes = yield (0, reviews_helper_1.getAllReviewsRequest)(product._id.toString(), {}, cookie);
            expect(allReviewsRes.status).toBe(200);
            expect(allReviewsRes.body.results).toBe(3);
            const reviewUserIds = allReviewsRes.body.data.reviews.map((r) => r.user._id);
            const expectedUserIds = users.map(u => u._id.toString());
            expectedUserIds.forEach(userId => {
                expect(reviewUserIds).toContain(userId);
            });
        }));
    });
});
