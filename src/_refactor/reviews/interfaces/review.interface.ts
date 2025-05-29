import mongoose from "mongoose";
import { IProduct } from "../../../types";
import { IUser } from "../../../types";

export interface IReviewDoc extends mongoose.Document {
	_id: string;
	comment: string;
	rating: number;
	user: IUser;
	product: IProduct;
}

export interface ReviewModel extends mongoose.Model<IReviewDoc> {
	calcAverageRatings(productId: string): void;
}
