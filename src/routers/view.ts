import express, { Request, Response } from "express";
import Product from "../models/product";
import viewMiddleware from "../middlewares/view";

const viewRouter = express.Router();

viewRouter.get("/", viewMiddleware.isLoggedIn, async (req: Request, res: Response) => {
	const products = await Product.find();

	res.status(200).render("home", {
		title: "Shop Flow - Home Page",
		products,
	});
});

viewRouter.get("/product-edit/:id", viewMiddleware.isLoggedIn, async (req: Request, res: Response) => {
	const product = await Product.findById(req.params.id);

	res.status(200).render("editProduct", {
		title: "Shop Flow - Edit Product",
		product,
	});
});

viewRouter.get("/product-create", viewMiddleware.isLoggedIn, async (req: Request, res: Response) => {
	res.status(200).render("createProduct", {
		title: "Shop Flow - Create Product",
	});
});

viewRouter.get("/login", viewMiddleware.isLoggedIn, async (req: Request, res: Response) => {
	res.status(200).render("login", {
		title: "Shop Flow - Login",
	});
});

export default viewRouter;
