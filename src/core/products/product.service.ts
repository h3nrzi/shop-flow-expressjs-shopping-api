import { PopulateOptions } from "mongoose";
import { ProductDoc } from "./product.interface";
import ProductRepository from "./product.repository";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { NotFoundError } from "../../errors/not-found-error";

export class ProductService {
	constructor(
		private readonly productRepository: ProductRepository,
	) {}

	async getAllProducts(
		query: any,
		initialFilter?: any,
	): Promise<{ pagination: any; products: ProductDoc[] }> {
		const { pagination, skip, total, products } =
			await this.productRepository.getAll(query, initialFilter);

		if (query.page && skip >= total) {
			throw new NotFoundError("این صفحه وجود ندارد");
		}

		return { pagination, products };
	}

	async getProductById(
		id: string,
		populate?: PopulateOptions,
	): Promise<ProductDoc> {
		const product = await this.productRepository.getOne(
			id,
			populate,
		);
		if (!product) {
			throw new NotFoundError(
				"هیچ محصولی با این شناسه یافت نشد",
			);
		}

		return product;
	}

	async createProduct(
		createProductDto: CreateProductDto,
	): Promise<ProductDoc> {
		return this.productRepository.createOne(createProductDto);
	}

	async updateProduct(
		id: string,
		updateProductDto: UpdateProductDto,
	): Promise<ProductDoc> {
		const product = await this.productRepository.updateOne(
			id,
			updateProductDto,
		);
		if (!product) {
			throw new NotFoundError(
				"هیچ محصولی با این شناسه یافت نشد",
			);
		}

		return product;
	}

	async deleteProduct(id: string): Promise<ProductDoc> {
		const product = await this.productRepository.deleteOne(id);
		if (!product) {
			throw new NotFoundError(
				"هیچ محصولی با این شناسه یافت نشد",
			);
		}

		return product;
	}
}
