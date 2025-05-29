import { Schema, model, Model, Query } from "mongoose";
import { IReviewDoc, ReviewModel } from "../interfaces/review.interface";
import Product from "../../products/entities/product.entity";

const reviewSchema = new Schema<IReviewDoc>({
	comment: {
		type: String,
		required: [true, "کامنت نظر را وارد کنید"],
	},
	rating: {
		type: Number,
		min: [1, "امتیاز نمی‌تواند کمتر از 1 باشد"],
		max: [5, "امتیاز نمی‌تواند بیشتر از 5 باشد"],
		required: [true, "امتیاز نظر را وارد کنید"],
	},

	// 1 : Many (Parent ref)
	product: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: [true, "آیدی محصول نظر را وارد کنید"],
	},

	// 1 : Many (Parent ref)
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: [true, "آیدی کاربر نظر را وارد کنید"],
	},
});

//////////// Static Methods ////////////

// Static method for calculating Average Ratings
reviewSchema.statics.calcAverageRatings = async function (
	this: Model<IReviewDoc>,
	productId: string
) {
	const stats = await this.aggregate([
		{
			$match: { product: productId },
		},
		{
			$group: {
				_id: "$product",
				numReviews: { $sum: 1 },
				rating: { $avg: "$rating" },
			},
		},
	]);

	await Product.findByIdAndUpdate(productId, {
		rating: stats[0]?.rating || 0,
		numReviews: stats[0]?.numReviews || 0,
	});
};

//////////// Document Middleware ////////////

// Calculating Average Ratings based on Creating a New Review
reviewSchema.post("save", function (doc, next) {
	(doc.constructor as ReviewModel).calcAverageRatings(doc.product as any);
	next();
});

//////////// Query Middleware ////////////

// Populating (product and user) field on Review
reviewSchema.pre(/^find/, async function (this: Query<any, IReviewDoc>, next) {
	this.populate("user product");
	next();
});

// Calculating Average Ratings based on update and delete review
reviewSchema.post(/^findOneAnd/, async function (doc) {
	if (doc) (doc.constructor as ReviewModel).calcAverageRatings(doc.product._id);
});

const Review = model<IReviewDoc, ReviewModel>("Review", reviewSchema);
export default Review;
