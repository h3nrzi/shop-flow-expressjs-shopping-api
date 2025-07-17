import { PopulateOptions } from "mongoose";
import { ProductDoc } from "./product.interface";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import APIFeatures from "../../utils/apiFeatures";
import { ProductModel } from "./product.entity";

class ProductRepository {
	constructor(private readonly Model: typeof ProductModel) {}

	async getAll(
		query: any,
		initialFilter?: any
	): Promise<{
		pagination: any;
		skip: number;
		total: number;
		products: ProductDoc[];
	}> {
		const features = new APIFeatures(this.Model as any, query, initialFilter);
		const { pagination, skip, total } = await features.filter().search().sort().limitFields().pagination();

		const products = await features.dbQuery;

		return { pagination, skip, total, products };
	}

	getOne(id: string, populate?: PopulateOptions): Promise<ProductDoc | null> {
		return this.Model.findById(id).populate(populate as PopulateOptions);
	}

	createOne(data: CreateProductDto): Promise<ProductDoc> {
		return this.Model.create(data);
	}

	updateOne(id: string, data: UpdateProductDto): Promise<ProductDoc | null> {
		return this.Model.findByIdAndUpdate(id, data, { new: true });
	}

	deleteOne(id: string): Promise<ProductDoc | null> {
		return this.Model.findByIdAndDelete(id);
	}
}

export default ProductRepository;
