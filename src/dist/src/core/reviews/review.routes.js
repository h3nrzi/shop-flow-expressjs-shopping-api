"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const review_1 = __importDefault(require("../../middlewares/review"));
const __1 = require("..");
const express_validator_1 = require("express-validator");
const validate_request_1 = require("../../middlewares/validate-request");
const router = express_1.default.Router({ mergeParams: true });
exports.reviewRouter = router;
router.get("/", [
    review_1.default.beforeGetAll,
    __1.reviewController.getAllReviews.bind(__1.reviewController),
]);
router.get("/:id", (0, express_validator_1.param)("id").isMongoId().withMessage("شناسه نظر معتبر نیست"), validate_request_1.validateRequest, __1.reviewController.getReviewById.bind(__1.reviewController));
router.use(auth_1.default.protect);
router.post("/", [
    review_1.default.beforeCreate,
    (0, express_validator_1.body)("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("امتیاز الزامی است"),
    (0, express_validator_1.body)("comment").isString().withMessage("نظر الزامی است"),
    (0, express_validator_1.body)("product")
        .isMongoId()
        .withMessage("شناسه محصول الزامی است"),
    (0, express_validator_1.body)("user").isMongoId().withMessage("شناسه کاربر الزامی است"),
    validate_request_1.validateRequest,
    __1.reviewController.createReview.bind(__1.reviewController),
]);
router.patch("/:id", [
    review_1.default.beforeUpdate,
    (0, express_validator_1.param)("id").isMongoId().withMessage("شناسه نظر معتبر نیست"),
    (0, express_validator_1.body)("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("امتیاز باید بین 1 و 5 باشد"),
    (0, express_validator_1.body)("comment")
        .optional()
        .isString()
        .withMessage("فرمت نظر معتبر نیست"),
    validate_request_1.validateRequest,
    __1.reviewController.updateReview.bind(__1.reviewController),
]);
router.delete("/:id", [
    review_1.default.beforeDelete,
    (0, express_validator_1.param)("productId")
        .isMongoId()
        .withMessage("شناسه نظر معتبر نیست"),
    (0, express_validator_1.param)("id").isMongoId().withMessage("شناسه نظر معتبر نیست"),
    validate_request_1.validateRequest,
    __1.reviewController.deleteReview.bind(__1.reviewController),
]);
