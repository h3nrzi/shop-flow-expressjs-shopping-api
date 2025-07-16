export interface CreateProductDto {
	name: string;
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
}
