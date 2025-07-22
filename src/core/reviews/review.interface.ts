import mongoose from "mongoose";
import { IUserDoc } from "../users/user.interface";
import { IProductDoc } from "../products/product.interface";

export interface IReviewDoc extends mongoose.Document {
	_id: string;
	comment: string;
	rating: number;
	user: IUserDoc;
	product: IProductDoc;
}

export interface ReviewModel extends mongoose.Model<IReviewDoc> {
	calcAverageRatings(productId: string): void;
}
