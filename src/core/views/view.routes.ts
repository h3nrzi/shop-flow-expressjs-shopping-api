import express from "express";
import { viewController } from "..";
import viewMiddleware from "../../middlewares/view";

const router = express.Router();

router.get("/login", viewController.getLoginPage.bind(viewController));

router.use(viewMiddleware.isLoggedIn);

router.get("/", viewController.getHomePage.bind(viewController));

router.get("/product-edit/:id", viewController.getEditProductPage.bind(viewController));

router.get("/product-create", viewController.getCreateProductPage.bind(viewController));

export { router as viewRouter };
