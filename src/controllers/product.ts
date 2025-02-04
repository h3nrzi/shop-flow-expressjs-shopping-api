import { Response } from "express";
import { Populate } from "../types";
import Product from "../models/product";
import CrudController from "./crud";

class ProductController extends CrudController {
	constructor(populate?: Populate) {
		super(Product, populate);
	}

	protected override sendCrudResponse(res: Response, data: any, statusCode: number, pagination?: any) {
		res.status(statusCode).json({
			status: "success",
			results: Array.isArray(data) ? data.length : undefined,
			pagination,
			data: Array.isArray(data) ? { products: data } : { product: data },
		});
	}
}

const productController = new ProductController();
export default productController;
