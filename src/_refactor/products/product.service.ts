import { PopulateOptions } from "mongoose";
import { ProductDoc } from "./interfaces/product.interface";
import ProductRepository from "./product.repository";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";

export class ProductService {
	constructor(private readonly productRepository: ProductRepository) {}

	async getAllProducts(populate?: PopulateOptions): Promise<ProductDoc[]> {
		return this.productRepository.getAll(populate);
	}

	async getProductById(id: string, populate?: PopulateOptions): Promise<ProductDoc> {
		const product = await this.productRepository.getOne(id, populate);
		if (!product) {
			throw new Error("Product not found");
		}

		return product;
	}

	async createProduct(createProductDto: CreateProductDto): Promise<ProductDoc> {
		return this.productRepository.createOne(createProductDto);
	}

	async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<ProductDoc> {
		const product = await this.productRepository.updateOne(id, updateProductDto);
		if (!product) {
			throw new Error("Product not found");
		}

		return product;
	}

	async deleteProduct(id: string): Promise<ProductDoc> {
		const product = await this.productRepository.deleteOne(id);
		if (!product) {
			throw new Error("Product not found");
		}

		return product;
	}
}
