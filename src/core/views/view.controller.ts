import { Request, Response } from "express";
import { ViewService } from "./view.service";

export class ViewController {
	constructor(readonly viewService: ViewService) {}

	async getHomePage(req: Request, res: Response): Promise<void> {
		const products = await this.viewService.getProducts();

		res.status(200).render("homePage", {
			title: "Shop Flow - Home Page",
			products,
		});
	}

	async getLoginPage(req: Request, res: Response): Promise<void> {
		res.status(200).render("loginPage", {
			title: "Shop Flow - Login",
		});
	}

	async getEditProductPage(req: Request, res: Response): Promise<void> {
		const product = await this.viewService.getProductById(req.params.id);

		res.status(200).render("editProductPage", {
			title: "Shop Flow - Edit Product",
			product,
		});
	}

	async getCreateProductPage(req: Request, res: Response): Promise<void> {
		res.status(200).render("createProductPage", {
			title: "Shop Flow - Create Product",
		});
	}
}
