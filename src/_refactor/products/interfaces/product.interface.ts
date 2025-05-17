import { Document, Model } from "mongoose";

export interface ProductDoc extends Document {
	_id: string;
	name: string;
	slug: string;
	description: string;
	image: string;
	images?: string[];
	countInStock: number;
	isAvailable: boolean;
	brand: string;
	category: string;
	rating: number;
	numReviews: number;
	price: number;
	discount: number;
	discountedPrice?: number;
}

export interface ProductModel extends Model<ProductDoc> {}
