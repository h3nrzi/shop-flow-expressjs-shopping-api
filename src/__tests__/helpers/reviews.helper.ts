import app from "@/app";
import request, { Response } from "supertest";
import { signupRequest, getUniqueUser } from "./auth.helper";
import { productRepository, userRepository, reviewRepository } from "@/core";
import { validProduct } from "./products.helper";
import mongoose from "mongoose";

// ===============================================
// ============ Helper Requests =================
// ===============================================

export const getAllReviewsRequest = (
	productId: string,
	query?: any,
	cookie?: string,
): Promise<Response> => {
	const queryString = query
		? Object.entries(query)
				.map(([key, value]) => `${key}=${value}`)
				.join("&")
		: "";

	const req = request(app).get(
		`/api/products/${productId}/reviews?${queryString}`,
	);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const getReviewByIdRequest = (
	productId: string,
	reviewId: string,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).get(
		`/api/products/${productId}/reviews/${reviewId}`,
	);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const createReviewRequest = (
	productId: string,
	body: any,
	cookie?: string,
): Promise<Response> => {
	const req = request(app)
		.post(`/api/products/${productId}/reviews`)
		.send(body);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const updateReviewRequest = (
	productId: string,
	reviewId: string,
	body: any,
	cookie?: string,
): Promise<Response> => {
	const req = request(app)
		.patch(`/api/products/${productId}/reviews/${reviewId}`)
		.send(body);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

export const deleteReviewRequest = (
	productId: string,
	reviewId: string,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).delete(
		`/api/products/${productId}/reviews/${reviewId}`,
	);

	if (cookie) {
		req.set("Cookie", cookie);
	}

	return req;
};

// ===============================================
// ============ Test Data & Utilities ===========
// ===============================================

export const validReview = {
	rating: 5,
	comment: "Excellent product!",
};

export const invalidReview = {
	rating: 6, // Invalid rating (should be 1-5)
	comment: 123, // Invalid comment type
};

export const getValidReviewData = (
	rating: number = 4,
	comment: string = "Great product!",
) => ({
	rating,
	comment,
});

export const getInvalidReviewData = () => [
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

// ===============================================
// ============ Setup Helper Functions ==========
// ===============================================

export const createTestUserAndGetCookie = async (
	suffix: string = "reviewer",
) => {
	const user = getUniqueUser(suffix);
	const signupResponse = await signupRequest(user);
	const cookie = signupResponse.headers["set-cookie"][0];
	const userDoc = await userRepository.findByEmail(user.email);
	if (!userDoc || !userDoc._id) {
		throw new Error("Failed to create test user");
	}
	// Convert to plain object to ensure _id is accessible
	const plainUser = userDoc.toObject ? userDoc.toObject() : userDoc;
	return { user: plainUser, cookie, userData: user };
};

export const createTestProduct = async () => {
	const product = await productRepository.createOne(validProduct);
	if (!product) {
		throw new Error("Failed to create test product - product is null");
	}
	if (!product._id) {
		console.log("Product created but _id is missing:", product);
		throw new Error("Failed to create test product - _id is missing");
	}
	// Ensure _id is accessible by converting to plain object or accessing directly
	const result = product.toObject ? product.toObject() : product;
	if (!result._id) {
		console.log("Result after toObject:", result);
		console.log("Original product:", product);
		throw new Error(
			"Failed to create test product - _id lost after conversion",
		);
	}
	return result;
};

export const createTestReview = async (
	productId: string,
	userId: string,
	reviewData = validReview,
) => {
	const review = await reviewRepository.create({
		...reviewData,
		product: productId,
		user: userId,
	});
	if (!review || !review._id) {
		throw new Error("Failed to create test review");
	}
	// Convert to plain object to ensure _id is accessible
	return review.toObject ? review.toObject() : review;
};

export const createMultipleTestReviews = async (
	productId: string,
	count: number = 3,
) => {
	const reviews = [];
	for (let i = 0; i < count; i++) {
		const { user } = await createTestUserAndGetCookie(`reviewer${i}`);
		const review = await createTestReview(productId, user._id.toString(), {
			rating: Math.floor(Math.random() * 5) + 1,
			comment: `Test review ${i + 1}`,
		});
		reviews.push(review);
	}
	return reviews;
};

export const getInvalidObjectId = () =>
	new mongoose.Types.ObjectId().toString();

export const getInvalidId = () => "invalid-id";

// ===============================================
// ============ Assertion Helpers ===============
// ===============================================

export const expectValidReviewResponse = (review: any, expectedData?: any) => {
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

export const expectValidPaginationResponse = (pagination: any) => {
	expect(pagination).toHaveProperty("page");
	expect(pagination).toHaveProperty("limit");
	expect(pagination).toHaveProperty("totalPages");
	expect(pagination).toHaveProperty("totalResults");
	expect(pagination).toHaveProperty("hasNextPage");
	expect(pagination).toHaveProperty("hasPrevPage");
};

export const expectProductRatingUpdate = async (
	productId: string,
	expectedRating?: number,
	expectedNumReviews?: number,
) => {
	const product = await productRepository.getOne(productId);
	expect(product).toBeTruthy();

	if (expectedRating !== undefined) {
		expect(product!.rating).toBeCloseTo(expectedRating, 1);
	}

	if (expectedNumReviews !== undefined) {
		expect(product!.numReviews).toBe(expectedNumReviews);
	}
};
