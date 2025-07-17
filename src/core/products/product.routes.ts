import { Router } from "express";
import authMiddleware from "../../middlewares/auth";
import { productController } from "..";
import { body, param } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";
import { reviewRouter } from "../reviews/review.routes";

const router = Router();

/************************************************************************
 *********  @description Protect all routes below to users only *********
 ************************************************************************/
router.use(authMiddleware.protect);

router.use(
	"/:productId/reviews",
	param("productId").isMongoId().withMessage("شناسه محصول معتبر نیست"),
	validateRequest,
	reviewRouter,
);

router.get("/", productController.getAllProducts.bind(productController));

router.get(
	"/:id",
	param("id").isMongoId().withMessage("شناسه محصول معتبر نیست"),
	validateRequest,
	productController.getProductById.bind(productController),
);

/************************************************************************
 *********  @description Protect all routes below to admin only *********
 ************************************************************************/
router.use(authMiddleware.restrictTo("admin"));

router.post(
	"/",
	body("name").isString().withMessage("نام محصول الزامی است"),
	body("description").isString().withMessage("توضیحات محصول الزامی است"),
	body("image").isString().withMessage("تصویر محصول الزامی است"),
	body("images").optional().isArray().withMessage("تصویرهای محصول الزامی است"),
	body("countInStock").isInt({ min: 0 }).withMessage("تعداد محصولات الزامی است"),
	body("isAvailable").isBoolean().withMessage("وضعیت محصول الزامی است"),
	body("brand").isString().withMessage("برند محصول الزامی است"),
	body("category").isString().withMessage("دسته بندی محصول الزامی است"),
	body("rating").isNumeric().withMessage("امتیاز محصول الزامی است"),
	body("numReviews").isInt({ min: 0 }).withMessage("تعداد بازخوردها محصول الزامی است"),
	body("price").isNumeric().withMessage("قیمت محصول الزامی است"),
	body("discount").isNumeric().withMessage("تخفیف محصول الزامی است"),
	validateRequest,
	productController.createProduct.bind(productController),
);

router.patch(
	"/:id",
	param("id").isMongoId().withMessage("شناسه محصول معتبر نیست"),
	body("name").optional().isString().withMessage("نام محصول الزامی است"),
	body("description").optional().isString().withMessage("توضیحات محصول الزامی است"),
	body("image").optional().isString().withMessage("تصویر محصول الزامی است"),
	body("images").optional().isArray().withMessage("تصویرهای محصول الزامی است"),
	body("countInStock").optional().isInt({ min: 0 }).withMessage("تعداد محصولات الزامی است"),
	body("isAvailable").optional().isBoolean().withMessage("وضعیت محصول الزامی است"),
	body("brand").optional().isString().withMessage("برند محصول الزامی است"),
	body("category").optional().isString().withMessage("دسته بندی محصول الزامی است"),
	body("rating").optional().isNumeric().withMessage("امتیاز محصول الزامی است"),
	body("numReviews").optional().isInt({ min: 0 }).withMessage("تعداد بازخوردها محصول الزامی است"),
	body("price").optional().isNumeric().withMessage("قیمت محصول الزامی است"),
	body("discount").optional().isNumeric().withMessage("تخفیف محصول الزامی است"),
	validateRequest,
	productController.updateProduct.bind(productController),
);

router.delete(
	"/:id",
	param("id").isMongoId().withMessage("شناسه محصول معتبر نیست"),
	validateRequest,
	productController.deleteProduct.bind(productController),
);

export { router as productRouter };
