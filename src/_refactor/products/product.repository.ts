import { Model, PopulateOptions } from "mongoose";
import { ProductDoc } from "./interfaces/product.interface";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";

class ProductRepository {
	constructor(private readonly Model: Model<ProductDoc>) {}

	getAll(populate?: PopulateOptions): Promise<ProductDoc[]> {
		return this.Model.find().populate(populate as {} as PopulateOptions);
	}

	getOne(id: string, populate?: PopulateOptions): Promise<ProductDoc | null> {
		return this.Model.findById(id).populate(populate as {} as PopulateOptions);
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
