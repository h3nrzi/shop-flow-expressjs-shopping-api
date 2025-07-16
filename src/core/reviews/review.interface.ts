import mongoose from "mongoose";
import { IUserDoc } from "../users/user.interface";
import { ProductDoc } from "../products/product.interface";

export interface IReviewDoc extends mongoose.Document {
	_id: string;
	comment: string;
	rating: number;
	user: IUserDoc;
	product: ProductDoc;
}

export interface ReviewModel extends mongoose.Model<IReviewDoc> {
	calcAverageRatings(productId: string): void;
}
