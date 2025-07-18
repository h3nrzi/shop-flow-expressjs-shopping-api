import { Request, Response } from "express";
import { ProductService } from "./product.service";

export class ProductController {
	constructor(private readonly productService: ProductService) {}

	async getAllProducts(req: Request, res: Response) {
		const { pagination, products } = await this.productService.getAllProducts(
			req.query,
			req.body.initialFilter,
		);

		res.status(200).json({
			status: "success",
			results: products.length,
			pagination,
			data: { products },
		});
	}

	async getProductById(req: Request, res: Response) {
		const product = await this.productService.getProductById(req.params.id);

		res.status(200).json({
			status: "success",
			data: { product },
		});
	}

	async createProduct(req: Request, res: Response) {
		const product = await this.productService.createProduct(req.body);

		res.status(201).json({
			status: "success",
			data: { product },
		});
	}

	async updateProduct(req: Request, res: Response) {
		const product = await this.productService.updateProduct(req.params.id, req.body);

		res.status(200).json({
			status: "success",
			data: { product },
		});
	}

	async deleteProduct(req: Request, res: Response) {
		await this.productService.deleteProduct(req.params.id);

		res.status(204).json({
			status: "success",
			data: null,
		});
	}
}
