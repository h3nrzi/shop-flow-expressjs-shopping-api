import { Document } from "mongoose";

export interface IProduct extends Document {
	_id: string;
	name: string;
	slug: string;
	description: string;
	image: string;
	images?: string[];
	countInStock: number; // default: 1
	isAvailable: boolean; // default: true
	brand: string;
	category: string;
	rating: number; // default: 4.5
	numReviews: number; // default: 1
	price: number;
	discount: number; // default: 0
	discountedPrice?: number; // Virtual Property
}
