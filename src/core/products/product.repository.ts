import { PopulateOptions } from "mongoose";
import APIFeatures from "../../utils/apiFeatures";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { IProductDoc, IProductModel } from "./product.interface";

class ProductRepository {
	constructor(private readonly productModel: IProductModel) {}

	async getAll(query: any): Promise<{
		pagination: any;
		skip: number;
		total: number;
		products: IProductDoc[];
	}> {
		const features = new APIFeatures(this.productModel as any, query);
		const { pagination, skip, total } = await features
			.filter()
			.search()
			.sort()
			.limitFields()
			.pagination();

		const products = await features.dbQuery;

		return { pagination, skip, total, products };
	}

	getOne(id: string, populate?: PopulateOptions): Promise<IProductDoc | null> {
		return this.productModel.findById(id).populate(populate as PopulateOptions);
	}

	createOne(data: CreateProductDto): Promise<IProductDoc> {
		return this.productModel.create(data);
	}

	updateOne(id: string, data: UpdateProductDto): Promise<IProductDoc | null> {
		return this.productModel.findByIdAndUpdate(id, data, {
			new: true,
		});
	}

	deleteOne(id: string): Promise<IProductDoc | null> {
		return this.productModel.findByIdAndDelete(id);
	}
}

export default ProductRepository;
