import { NotFoundError } from "../../errors/not-found-error";
import { ProductModel } from "../products/product.entity";
import { ProductDoc } from "../products/product.interface";

export class ViewService {
	constructor(readonly productModel: typeof ProductModel) {}

	async getProducts(): Promise<ProductDoc[]> {
		return await this.productModel.find();
	}

	async getProductById(id: string): Promise<ProductDoc | null> {
		const product = await this.productModel.findById(id);

		if (!product) {
			throw new NotFoundError("Product not found");
		}

		return product;
	}
}
