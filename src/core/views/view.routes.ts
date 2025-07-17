import express from "express";
import viewMiddleware from "../../middlewares/view";
import { viewController } from "..";

const router = express.Router();

router.use(viewMiddleware.isLoggedIn);

router.get("/login", viewController.getLoginPage.bind(viewController));

router.get("/", viewController.getHomePage.bind(viewController));

router.get("/product-edit/:id", viewController.getEditProductPage.bind(viewController));

router.get("/product-create", viewController.getCreateProductPage.bind(viewController));

export { router as viewRouter };
