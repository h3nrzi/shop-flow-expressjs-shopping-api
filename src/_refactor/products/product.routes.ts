import { Router } from "express";
import authMiddleware from "../../middlewares/auth";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import ProductRepository from "./product.repository";
import Product from "./entities/product.entity";

const router = Router();
const productRepository = new ProductRepository(Product);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get(
	"/:productId/reviews",
	authMiddleware.protect,
	// TODO: bind the controller method to the router
);

router.get("/", productController.getAllProducts.bind(productController));
router.get("/:id", productController.getProductById.bind(productController));

router.post(
	"/",
	// TODO: Validation rules
	// TODO: validateRequest
	authMiddleware.protect,
	authMiddleware.restrictTo("admin"),
	productController.createProduct.bind(productController),
);

router.patch(
	"/:id",
	// TODO: Validation rules
	// TODO: validateRequest
	authMiddleware.protect,
	authMiddleware.restrictTo("admin"),
	productController.updateProduct.bind(productController),
);

router.delete(
	"/:id",
	authMiddleware.protect,
	authMiddleware.restrictTo("admin"),
	productController.deleteProduct.bind(productController),
);

export { router as productRouter };
