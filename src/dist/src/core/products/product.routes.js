"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const __1 = require("..");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validate_request_1 = require("../../middlewares/validate-request");
const review_routes_1 = require("../reviews/review.routes");
const router = (0, express_1.Router)();
exports.productRouter = router;
router.use("/:productId/reviews", review_routes_1.reviewRouter);
router.get("/", __1.productController.getAllProducts.bind(__1.productController));
router.get("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("شناسه محصول معتبر نیست"), validate_request_1.validateRequest, __1.productController.getProductById.bind(__1.productController));
router.use(auth_1.default.protect);
router.use(auth_1.default.restrictTo("admin"));
router.post("/", (0, express_validator_1.body)("name")
    .exists({ checkFalsy: true })
    .isString()
    .withMessage("نام محصول الزامی است"), (0, express_validator_1.body)("description")
    .exists({ checkFalsy: true })
    .isString()
    .withMessage("توضیحات محصول الزامی است"), (0, express_validator_1.body)("image")
    .exists({ checkFalsy: true })
    .isString()
    .withMessage("تصویر محصول الزامی است"), (0, express_validator_1.body)("images")
    .optional()
    .isArray()
    .withMessage("تصویرهای محصول باید آرایه باشد"), (0, express_validator_1.body)("countInStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("تعداد محصولات باید عدد صحیح و مثبت باشد"), (0, express_validator_1.body)("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("وضعیت محصول باید بولین باشد"), (0, express_validator_1.body)("brand")
    .exists({ checkFalsy: true })
    .isString()
    .withMessage("برند محصول الزامی است"), (0, express_validator_1.body)("category")
    .exists({ checkFalsy: true })
    .isString()
    .withMessage("دسته بندی محصول الزامی است"), (0, express_validator_1.body)("rating")
    .optional()
    .isNumeric()
    .withMessage("امتیاز محصول باید عددی باشد"), (0, express_validator_1.body)("numReviews")
    .optional()
    .isInt({ min: 0 })
    .withMessage("تعداد بازخوردها باید عدد صحیح و مثبت باشد"), (0, express_validator_1.body)("price")
    .exists({ checkFalsy: true })
    .isNumeric()
    .withMessage("قیمت محصول الزامی است"), (0, express_validator_1.body)("discount")
    .optional()
    .isNumeric()
    .withMessage("تخفیف محصول باید عددی باشد"), validate_request_1.validateRequest, __1.productController.createProduct.bind(__1.productController));
router.patch("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("شناسه محصول معتبر نیست"), (0, express_validator_1.body)("name")
    .optional()
    .isString()
    .withMessage("نام محصول الزامی است"), (0, express_validator_1.body)("description")
    .optional()
    .isString()
    .withMessage("توضیحات محصول الزامی است"), (0, express_validator_1.body)("image")
    .optional()
    .isString()
    .withMessage("تصویر محصول الزامی است"), (0, express_validator_1.body)("countInStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("تعداد محصولات الزامی است"), (0, express_validator_1.body)("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("وضعیت محصول الزامی است"), (0, express_validator_1.body)("brand")
    .optional()
    .isString()
    .withMessage("برند محصول الزامی است"), (0, express_validator_1.body)("category")
    .optional()
    .isString()
    .withMessage("دسته بندی محصول الزامی است"), (0, express_validator_1.body)("rating")
    .optional()
    .isNumeric()
    .withMessage("امتیاز محصول الزامی است"), (0, express_validator_1.body)("numReviews")
    .optional()
    .isInt({ min: 0 })
    .withMessage("تعداد بازخوردها محصول الزامی است"), (0, express_validator_1.body)("price")
    .optional()
    .isNumeric()
    .withMessage("قیمت محصول الزامی است"), (0, express_validator_1.body)("discount")
    .optional()
    .isNumeric()
    .withMessage("تخفیف محصول الزامی است"), validate_request_1.validateRequest, __1.productController.updateProduct.bind(__1.productController));
router.delete("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("شناسه محصول معتبر نیست"), validate_request_1.validateRequest, __1.productController.deleteProduct.bind(__1.productController));
