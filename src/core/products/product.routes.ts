import { Router } from "express";
import authMiddleware from "../../middlewares/auth";
import { productController } from "..";
import { reviewRouter } from "../reviews/review.routes";

const router = Router();

/************************************************************************
 *********  @description Protect all routes below to users only *********
 ************************************************************************/
router.use(authMiddleware.protect);

router.use("/:productId/reviews", reviewRouter);
router.get("/", productController.getAllProducts.bind(productController));
router.get("/:id", productController.getProductById.bind(productController));

/************************************************************************
 *********  @description Protect all routes below to admin only *********
 ************************************************************************/
router.use(authMiddleware.restrictTo("admin"));

router.post(
	"/",
	// TODO: Validation rules
	// TODO: validateRequest
	productController.createProduct.bind(productController)
);

router.patch(
	"/:id",
	// TODO: Validation rules
	// TODO: validateRequest
	productController.updateProduct.bind(productController)
);

router.delete("/:id", productController.deleteProduct.bind(productController));

export { router as productRouter };
