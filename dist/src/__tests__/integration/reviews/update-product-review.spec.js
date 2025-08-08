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
describe("PATCH /api/products/:productId/reviews/:id", () => {
    let product;
    let user;
    let cookie;
    let review;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        product = yield (0, reviews_helper_1.createTestProduct)();
        const testUser = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer");
        user = testUser.user;
        cookie = testUser.cookie;
        review = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user._id.toString(), { rating: 3, comment: "Average product" });
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 4,
                comment: "Updated comment",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 4,
                comment: "Updated comment",
            };
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("product ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 4,
                comment: "Updated comment",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)((0, reviews_helper_1.getInvalidId)(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(400);
        }));
        it("review ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 4,
                comment: "Updated comment",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), (0, reviews_helper_1.getInvalidId)(), updateData, cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("شناسه نظر معتبر نیست");
        }));
        it("rating is below minimum (0)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { rating: 0 };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("امتیاز باید بین 1 و 5 باشد");
        }));
        it("rating is above maximum (6)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { rating: 6 };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("امتیاز باید بین 1 و 5 باشد");
        }));
        it("rating is not a number", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { rating: "five" };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("امتیاز باید بین 1 و 5 باشد");
        }));
        it("comment is not a string", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { comment: 123 };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("فرمت نظر معتبر نیست");
        }));
        it("product field is provided (should be ignored by middleware)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 4,
                comment: "Updated comment",
                product: (0, reviews_helper_1.getInvalidObjectId)(),
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review.product._id).toBe(product._id.toString());
        }));
    });
    describe("should return 403, if", () => {
        it("user tries to update another user's review", () => __awaiter(void 0, void 0, void 0, function* () {
            const { user: anotherUser } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer2");
            const anotherReview = yield (0, reviews_helper_1.createTestReview)(product._id.toString(), anotherUser._id.toString(), { rating: 2, comment: "Poor product" });
            const updateData = {
                rating: 5,
                comment: "Trying to update others review",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), anotherReview._id.toString(), updateData, cookie);
            expect(res.status).toBe(403);
        }));
    });
    describe("should return 404, if", () => {
        it("product does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentProductId = (0, reviews_helper_1.getInvalidObjectId)();
            const updateData = {
                rating: 4,
                comment: "Updated comment",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(nonExistentProductId, review._id.toString(), updateData, cookie);
            expect(res.status).toBe(404);
        }));
        it("review does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentReviewId = (0, reviews_helper_1.getInvalidObjectId)();
            const updateData = {
                rating: 4,
                comment: "Updated comment",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), nonExistentReviewId, updateData, cookie);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("نظری با این شناسه یافت نشد");
        }));
        it("review exists but belongs to different product", () => __awaiter(void 0, void 0, void 0, function* () {
            const anotherProduct = yield (0, reviews_helper_1.createTestProduct)();
            const anotherReview = yield (0, reviews_helper_1.createTestReview)(anotherProduct._id.toString(), user._id.toString(), { rating: 3, comment: "Different product review" });
            const updateData = {
                rating: 4,
                comment: "Updated comment",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), anotherReview._id.toString(), updateData, cookie);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("نظری با این شناسه یافت نشد");
        }));
    });
    describe("should return 200, if", () => {
        it("review is updated successfully with both rating and comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 5,
                comment: "Excellent product after update!",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data).toHaveProperty("review");
            const updatedReview = res.body.data.review;
            (0, reviews_helper_1.expectValidReviewResponse)(updatedReview, updateData);
            expect(updatedReview._id).toBe(review._id.toString());
            expect(updatedReview.rating).toBe(5);
            expect(updatedReview.comment).toBe("Excellent product after update!");
        }));
        it("review is updated with only rating", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { rating: 1 };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.rating).toBe(1);
            expect(updatedReview.comment).toBe("Average product");
        }));
        it("review is updated with only comment", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = { comment: "Updated comment only" };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.rating).toBe(3);
            expect(updatedReview.comment).toBe("Updated comment only");
        }));
        it("review is updated with minimum rating (1)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 1,
                comment: "Very poor product",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review.rating).toBe(1);
        }));
        it("review is updated with maximum rating (5)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 5,
                comment: "Perfect product",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review.rating).toBe(5);
        }));
        it("product rating is recalculated after review update", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3, 1);
            const updateData = { rating: 5 };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 5, 1);
        }));
        it("product average rating is recalculated correctly with multiple reviews", () => __awaiter(void 0, void 0, void 0, function* () {
            const { user: user2 } = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer2");
            yield (0, reviews_helper_1.createTestReview)(product._id.toString(), user2._id.toString(), {
                rating: 5,
                comment: "Excellent!",
            });
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 4, 2);
            const updateData = { rating: 1 };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            yield (0, reviews_helper_1.expectProductRatingUpdate)(product._id.toString(), 3, 2);
        }));
        it("updated review includes populated user and product data", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 4,
                comment: "Updated review",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.user).toHaveProperty("_id");
            expect(updatedReview.user).toHaveProperty("name");
            expect(updatedReview.user).toHaveProperty("email");
            expect(updatedReview.user._id).toBe(user._id.toString());
            expect(updatedReview.product).toHaveProperty("_id");
            expect(updatedReview.product).toHaveProperty("name");
            expect(updatedReview.product).toHaveProperty("price");
            expect(updatedReview.product._id).toBe(product._id.toString());
        }));
        it("updatedAt timestamp is modified after update", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalUpdatedAt = review.updatedAt;
            yield new Promise((resolve) => setTimeout(resolve, 10));
            const updateData = {
                rating: 4,
                comment: "Updated review",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(new Date(updatedReview.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
        }));
        it("createdAt timestamp remains unchanged after update", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalCreatedAt = review.createdAt;
            const updateData = {
                rating: 4,
                comment: "Updated review",
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.createdAt).toBe(originalCreatedAt.toISOString());
        }));
    });
    describe("edge cases", () => {
        it("handles empty update object", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {};
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.rating).toBe(3);
            expect(updatedReview.comment).toBe("Average product");
        }));
        it("handles very long comment update", () => __awaiter(void 0, void 0, void 0, function* () {
            const longComment = "A".repeat(1000);
            const updateData = { comment: longComment };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review.comment).toBe(longComment);
            expect(res.body.data.review.comment.length).toBe(1000);
        }));
        it("handles special characters in comment update", () => __awaiter(void 0, void 0, void 0, function* () {
            const specialComment = "Updated! 🎉 100% better now. Price: $99.99 & more...";
            const updateData = { comment: specialComment };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review.comment).toBe(specialComment);
        }));
        it("handles unicode characters in comment update", () => __awaiter(void 0, void 0, void 0, function* () {
            const unicodeComment = "به‌روزرسانی شد! محصول عالی 👍";
            const updateData = { comment: unicodeComment };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            expect(res.body.data.review.comment).toBe(unicodeComment);
        }));
        it("ignores unknown fields in update data", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 4,
                comment: "Updated comment",
                unknownField: "should be ignored",
                anotherField: 123,
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.rating).toBe(4);
            expect(updatedReview.comment).toBe("Updated comment");
            expect(updatedReview).not.toHaveProperty("unknownField");
            expect(updatedReview).not.toHaveProperty("anotherField");
        }));
        it("handles concurrent update attempts", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData1 = { rating: 4, comment: "First update" };
            const updateData2 = {
                rating: 5,
                comment: "Second update",
            };
            const [res1, res2] = yield Promise.all([
                (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData1, cookie),
                (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData2, cookie),
            ]);
            expect(res1.status).toBe(200);
            expect(res2.status).toBe(200);
        }));
    });
    describe("middleware functionality", () => {
        it("middleware correctly filters update fields", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                rating: 4,
                comment: "Updated comment",
                user: (0, reviews_helper_1.getInvalidObjectId)(),
                product: (0, reviews_helper_1.getInvalidObjectId)(),
                _id: (0, reviews_helper_1.getInvalidObjectId)(),
                createdAt: new Date().toISOString(),
            };
            const res = yield (0, reviews_helper_1.updateReviewRequest)(product._id.toString(), review._id.toString(), updateData, cookie);
            expect(res.status).toBe(200);
            const updatedReview = res.body.data.review;
            expect(updatedReview.rating).toBe(4);
            expect(updatedReview.comment).toBe("Updated comment");
            expect(updatedReview.user._id).toBe(user._id.toString());
            expect(updatedReview.product._id).toBe(product._id.toString());
            expect(updatedReview._id).toBe(review._id.toString());
        }));
    });
});
