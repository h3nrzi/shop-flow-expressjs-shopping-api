import { NotFoundError } from "../../errors/not-found-error";
import { IProductDoc, IProductModel } from "../products/product.interface";

export class ViewService {
	constructor(private readonly productModel: IProductModel) {}

	async getProducts(): Promise<IProductDoc[]> {
		return await this.productModel.find();
	}

	async getProductById(id: string): Promise<IProductDoc | null> {
		const product = await this.productModel.findById(id);

		if (!product) {
			throw new NotFoundError("Product not found");
		}

		return product;
	}
}
