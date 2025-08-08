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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectProductRatingUpdate = exports.expectValidPaginationResponse = exports.expectValidReviewResponse = exports.getInvalidId = exports.getInvalidObjectId = exports.createMultipleTestReviews = exports.createTestReview = exports.createTestProduct = exports.createTestUserAndGetCookie = exports.getInvalidReviewData = exports.getValidReviewData = exports.invalidReview = exports.validReview = exports.deleteReviewRequest = exports.updateReviewRequest = exports.createReviewRequest = exports.getReviewByIdRequest = exports.getAllReviewsRequest = void 0;
const app_1 = __importDefault(require("@/app"));
const supertest_1 = __importDefault(require("supertest"));
const auth_helper_1 = require("./auth.helper");
const core_1 = require("@/core");
const products_helper_1 = require("./products.helper");
const mongoose_1 = __importDefault(require("mongoose"));
const getAllReviewsRequest = (productId, query, cookie) => {
    const queryString = query
        ? Object.entries(query)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
        : "";
    const req = (0, supertest_1.default)(app_1.default).get(`/api/products/${productId}/reviews?${queryString}`);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.getAllReviewsRequest = getAllReviewsRequest;
const getReviewByIdRequest = (productId, reviewId, cookie) => {
    const req = (0, supertest_1.default)(app_1.default).get(`/api/products/${productId}/reviews/${reviewId}`);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.getReviewByIdRequest = getReviewByIdRequest;
const createReviewRequest = (productId, body, cookie) => {
    const req = (0, supertest_1.default)(app_1.default)
        .post(`/api/products/${productId}/reviews`)
        .send(body);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.createReviewRequest = createReviewRequest;
const updateReviewRequest = (productId, reviewId, body, cookie) => {
    const req = (0, supertest_1.default)(app_1.default)
        .patch(`/api/products/${productId}/reviews/${reviewId}`)
        .send(body);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.updateReviewRequest = updateReviewRequest;
const deleteReviewRequest = (productId, reviewId, cookie) => {
    const req = (0, supertest_1.default)(app_1.default).delete(`/api/products/${productId}/reviews/${reviewId}`);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.deleteReviewRequest = deleteReviewRequest;
exports.validReview = {
    rating: 5,
    comment: "Excellent product!",
};
exports.invalidReview = {
    rating: 6,
    comment: 123,
};
const getValidReviewData = (rating = 4, comment = "Great product!") => ({
    rating,
    comment,
});
exports.getValidReviewData = getValidReviewData;
const getInvalidReviewData = () => [
    {
        testCase: "Rating is missing",
        data: { comment: "Good product" },
        expectedError: "امتیاز الزامی است",
    },
    {
        testCase: "Rating is below minimum (0)",
        data: { rating: 0, comment: "Bad product" },
        expectedError: "امتیاز الزامی است",
    },
    {
        testCase: "Rating is above maximum (6)",
        data: { rating: 6, comment: "Excellent product" },
        expectedError: "امتیاز الزامی است",
    },
    {
        testCase: "Rating is not a number",
        data: { rating: "five", comment: "Good product" },
        expectedError: "امتیاز الزامی است",
    },
    {
        testCase: "Comment is missing",
        data: { rating: 4 },
        expectedError: "نظر الزامی است",
    },
    {
        testCase: "Comment is not a string",
        data: { rating: 4, comment: 123 },
        expectedError: "نظر الزامی است",
    },
];
exports.getInvalidReviewData = getInvalidReviewData;
const createTestUserAndGetCookie = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (suffix = "reviewer") {
    const user = (0, auth_helper_1.getUniqueUser)(suffix);
    const signupResponse = yield (0, auth_helper_1.signupRequest)(user);
    const cookie = signupResponse.headers["set-cookie"][0];
    const userDoc = yield core_1.userRepository.findByEmail(user.email);
    if (!userDoc || !userDoc._id) {
        throw new Error("Failed to create test user");
    }
    const plainUser = userDoc.toObject ? userDoc.toObject() : userDoc;
    return { user: plainUser, cookie, userData: user };
});
exports.createTestUserAndGetCookie = createTestUserAndGetCookie;
const createTestProduct = () => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield core_1.productRepository.createOne(products_helper_1.validProduct);
    if (!product) {
        throw new Error("Failed to create test product - product is null");
    }
    if (!product._id) {
        console.log("Product created but _id is missing:", product);
        throw new Error("Failed to create test product - _id is missing");
    }
    const result = product.toObject ? product.toObject() : product;
    if (!result._id) {
        console.log("Result after toObject:", result);
        console.log("Original product:", product);
        throw new Error("Failed to create test product - _id lost after conversion");
    }
    return result;
});
exports.createTestProduct = createTestProduct;
const createTestReview = (productId_1, userId_1, ...args_1) => __awaiter(void 0, [productId_1, userId_1, ...args_1], void 0, function* (productId, userId, reviewData = exports.validReview) {
    const review = yield core_1.reviewRepository.create(Object.assign(Object.assign({}, reviewData), { product: productId, user: userId }));
    if (!review || !review._id) {
        throw new Error("Failed to create test review");
    }
    return review.toObject ? review.toObject() : review;
});
exports.createTestReview = createTestReview;
const createMultipleTestReviews = (productId_1, ...args_1) => __awaiter(void 0, [productId_1, ...args_1], void 0, function* (productId, count = 3) {
    const reviews = [];
    for (let i = 0; i < count; i++) {
        const { user } = yield (0, exports.createTestUserAndGetCookie)(`reviewer${i}`);
        const review = yield (0, exports.createTestReview)(productId, user._id.toString(), {
            rating: Math.floor(Math.random() * 5) + 1,
            comment: `Test review ${i + 1}`,
        });
        reviews.push(review);
    }
    return reviews;
});
exports.createMultipleTestReviews = createMultipleTestReviews;
const getInvalidObjectId = () => new mongoose_1.default.Types.ObjectId().toString();
exports.getInvalidObjectId = getInvalidObjectId;
const getInvalidId = () => "invalid-id";
exports.getInvalidId = getInvalidId;
const expectValidReviewResponse = (review, expectedData) => {
    expect(review).toHaveProperty("_id");
    expect(review).toHaveProperty("rating");
    expect(review).toHaveProperty("comment");
    expect(review).toHaveProperty("product");
    expect(review).toHaveProperty("user");
    expect(review).toHaveProperty("createdAt");
    expect(review).toHaveProperty("updatedAt");
    if (expectedData) {
        expect(review.rating).toBe(expectedData.rating);
        expect(review.comment).toBe(expectedData.comment);
    }
};
exports.expectValidReviewResponse = expectValidReviewResponse;
const expectValidPaginationResponse = (pagination) => {
    expect(pagination).toHaveProperty("page");
    expect(pagination).toHaveProperty("limit");
    expect(pagination).toHaveProperty("totalPages");
    expect(pagination).toHaveProperty("totalResults");
    expect(pagination).toHaveProperty("hasNextPage");
    expect(pagination).toHaveProperty("hasPrevPage");
};
exports.expectValidPaginationResponse = expectValidPaginationResponse;
const expectProductRatingUpdate = (productId, expectedRating, expectedNumReviews) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield core_1.productRepository.getOne(productId);
    expect(product).toBeTruthy();
    if (expectedRating !== undefined) {
        expect(product.rating).toBeCloseTo(expectedRating, 1);
    }
    if (expectedNumReviews !== undefined) {
        expect(product.numReviews).toBe(expectedNumReviews);
    }
});
exports.expectProductRatingUpdate = expectProductRatingUpdate;
