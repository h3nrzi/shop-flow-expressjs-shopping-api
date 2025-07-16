import express, { Request, Response } from "express";
import Product from "../core/products/product.entity";
import viewMiddleware from "../middlewares/view";

const viewRouter = express.Router();

viewRouter.get(
	"/",
	viewMiddleware.isLoggedIn,
	async (req: Request, res: Response) => {
		const products = await Product.find();

		res.status(200).render("homePage", {
			title: "Shop Flow - Home Page",
			products,
		});
	}
);

viewRouter.get(
	"/product-edit/:id",
	viewMiddleware.isLoggedIn,
	async (req: Request, res: Response) => {
		const product = await Product.findById(req.params.id);

		res.status(200).render("editProductPage", {
			title: "Shop Flow - Edit Product",
			product,
		});
	}
);

viewRouter.get(
	"/product-create",
	viewMiddleware.isLoggedIn,
	async (req: Request, res: Response) => {
		res.status(200).render("createProductPage", {
			title: "Shop Flow - Create Product",
		});
	}
);

viewRouter.get("/login", async (req: Request, res: Response) => {
	res.status(200).render("loginPage", {
		title: "Shop Flow - Login",
	});
});

export default viewRouter;
