import { Request, Response } from "express";
import { ProductService } from "./product.service";

export class ProductController {
	constructor(private readonly productService: ProductService) {}

	async getAllProducts(req: Request, res: Response) {
		const products = await this.productService.getAllProducts();

		return res.status(200).json({
			status: "success",
			results: products.length,
			data: { products },
		});
	}

	async getProductById(req: Request, res: Response) {
		const product = await this.productService.getProductById(req.params.id);

		return res.status(200).json({
			status: "success",
			data: { product },
		});
	}

	async createProduct(req: Request, res: Response) {
		const product = await this.productService.createProduct(req.body);

		return res.status(201).json({
			status: "success",
			data: { product },
		});
	}

	async updateProduct(req: Request, res: Response) {
		const product = await this.productService.updateProduct(req.params.id, req.body);

		return res.status(200).json({
			status: "success",
			data: { product },
		});
	}

	async deleteProduct(req: Request, res: Response) {
		await this.productService.deleteProduct(req.params.id);

		return res.status(204).json({
			status: "success",
			data: null,
		});
	}
}
