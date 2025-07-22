import { Document, Model } from "mongoose";

export interface IProductQuery {
	// filters
	brand?: string;
	category?: string;
	countInStock?: number;
	isAvailable?: boolean;
	rating?: number;
	numReviews?: number;
	price?: number;
	discount?: number;
	discountedPrice?: number;

	// pagination
	page?: number;
	limit?: number;

	// sort
	sort?: "asc" | "desc";

	// search
	search?: string;
}

export interface IProductDoc extends Document {
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

export interface IProductModel extends Model<IProductDoc> {}
