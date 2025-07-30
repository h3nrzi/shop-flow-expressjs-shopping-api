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
describe("POST /api/products/:productId/reviews", () => {
    let product;
    let cookie;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        product = yield (0, reviews_helper_1.createTestProduct)();
        const testUser = yield (0, reviews_helper_1.createTestUserAndGetCookie)("reviewer");
        cookie = testUser.cookie;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = (0, reviews_helper_1.getValidReviewData)();
            const res = yield (0, reviews_helper_1.createReviewRequest)(product.id, reviewData);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = (0, reviews_helper_1.getValidReviewData)();
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, reviews_helper_1.createReviewRequest)(product.id, reviewData, invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("product ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = (0, reviews_helper_1.getValidReviewData)();
            const res = yield (0, reviews_helper_1.createReviewRequest)((0, reviews_helper_1.getInvalidId)(), reviewData, cookie);
            expect(res.status).toBe(400);
        }));
        const invalidDataCases = (0, reviews_helper_1.getInvalidReviewData)();
        invalidDataCases.forEach(({ testCase, data, expectedError }) => {
            it(testCase, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, reviews_helper_1.createReviewRequest)(product.id, data, cookie);
                expect(res.status).toBe(400);
                expect(res.body.errors[0].message).toBe(expectedError);
            }));
        });
    });
    describe("should return 404, if", () => {
        it("product does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = (0, reviews_helper_1.getValidReviewData)();
            const nonExistentProductId = (0, reviews_helper_1.getInvalidObjectId)();
            const res = yield (0, reviews_helper_1.createReviewRequest)(nonExistentProductId, reviewData, cookie);
            expect(res.status).toBe(404);
        }));
    });
    describe("should return 201, if", () => {
        it("review is created successfully with valid data", () => __awaiter(void 0, void 0, void 0, function* () {
            const reviewData = (0, reviews_helper_1.getValidReviewData)(4, "Great product!");
            const res = yield (0, reviews_helper_1.createReviewRequest)(product.id, reviewData, cookie);
            expect(res.status).toBe(201);
        }));
    });
});
