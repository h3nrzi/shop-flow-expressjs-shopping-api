"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const __1 = require("..");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validate_request_1 = require("../../middlewares/validate-request");
const router = express_1.default.Router();
exports.userRouter = router;
router.post("/signup", [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("نام کاربر الزامی است")
        .isString()
        .withMessage("فرمت نام کاربر باید string باشد"),
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("ایمیل کاربر الزامی است")
        .isEmail()
        .withMessage("ایمیل وارد شده معتبر نیست"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("رمز عبور کاربر الزامی است")
        .isString()
        .withMessage("فرمت رمز عبور کاربر باید string باشد")
        .isLength({ min: 8 })
        .withMessage("رمز عبور کاربر باید حداقل 8 کاراکتر باشد"),
    (0, express_validator_1.body)("passwordConfirmation")
        .notEmpty()
        .withMessage("تایید رمز عبور کاربر الزامی است")
        .isString()
        .withMessage("فرمت تایید رمز عبور کاربر باید string باشد")
        .custom((value, { req }) => {
        if (value !== req.body.password)
            return false;
        return true;
    })
        .withMessage("رمز عبور و تایید رمز عبور باید یکسان باشد"),
    validate_request_1.validateRequest,
    __1.authController.signup.bind(__1.authController),
]);
router.post("/login", [
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("ایمیل کاربر الزامی است")
        .isEmail()
        .withMessage("فرمت ایمیل وارد شده معتبر نیست"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("رمز عبور کاربر الزامی است")
        .isString()
        .withMessage("فرمت رمز عبور کاربر باید string باشد"),
    validate_request_1.validateRequest,
    __1.authController.login.bind(__1.authController),
]);
router.post("/logout", __1.authController.logout.bind(__1.authController));
router.post("/forgot-password", [
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("ایمیل کاربر الزامی است")
        .isEmail()
        .withMessage("فرمت ایمیل وارد شده معتبر نیست"),
    validate_request_1.validateRequest,
    __1.authController.forgotPassword.bind(__1.authController),
]);
router.patch("/reset-password", [
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("رمز عبور کاربر الزامی است")
        .isString()
        .withMessage("فرمت رمز عبور کاربر باید string باشد")
        .isLength({ min: 8 })
        .withMessage("رمز عبور کاربر باید حداقل 8 کاراکتر باشد"),
    (0, express_validator_1.body)("passwordConfirmation")
        .notEmpty()
        .withMessage("تایید رمز عبور کاربر الزامی است")
        .isString()
        .withMessage("فرمت تایید رمز عبور کاربر باید string باشد")
        .custom((value, { req }) => {
        if (value !== req.body.password)
            return false;
        return true;
    })
        .withMessage("رمز عبور و تایید رمز عبور باید یکسان باشد"),
    (0, express_validator_1.query)("resetToken")
        .notEmpty()
        .withMessage("ریست توکن کاربر الزامی است")
        .isString()
        .withMessage("ریست توکن کاربر باید string باشد"),
    validate_request_1.validateRequest,
    __1.authController.resetPassword.bind(__1.authController),
]);
router.post("/refresh-token", __1.authController.refreshToken.bind(__1.authController));
router.use(auth_1.default.protect);
router.get("/get-me", __1.userController.getCurrentUser.bind(__1.userController));
router.patch("/update-me", [
    (0, express_validator_1.body)("name")
        .optional()
        .notEmpty()
        .withMessage("نام کاربر الزامی است")
        .isString()
        .withMessage("فرمت نام کاربر معتبر نیست"),
    (0, express_validator_1.body)("email")
        .optional()
        .notEmpty()
        .withMessage("ایمیل کاربر الزامی است")
        .isEmail()
        .withMessage("فرمت ایمیل کاربر معتبر نیست"),
    (0, express_validator_1.body)("photo")
        .optional()
        .notEmpty()
        .withMessage("تصویر کاربر الزامی است")
        .isString()
        .withMessage("فرمت تصویر کاربر معتبر نیست"),
    validate_request_1.validateRequest,
    __1.userController.updateCurrentUserInfo.bind(__1.userController),
]);
router.patch("/update-me-password", [
    (0, express_validator_1.body)("passwordCurrent")
        .notEmpty()
        .withMessage("رمز عبور فعلی کاربر الزامی است")
        .isString()
        .withMessage("فرمت رمز عبور فعلی کاربر معتبر نیست"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("رمز عبور کاربر الزامی است")
        .isString()
        .withMessage("فرمت رمز عبور کاربر معتبر نیست")
        .isLength({ min: 8 })
        .withMessage("رمز عبور کاربر باید حداقل 8 کاراکتر باشد"),
    (0, express_validator_1.body)("passwordConfirmation")
        .notEmpty()
        .withMessage("تایید رمز عبور کاربر الزامی است")
        .isString()
        .withMessage("فرمت تایید رمز عبور کاربر معتبر نیست"),
    (0, express_validator_1.body)("passwordConfirmation")
        .custom((value, { req }) => {
        if (value !== req.body.password)
            return false;
        return true;
    })
        .withMessage("رمز عبور و تایید رمز عبور باید یکسان باشد"),
    validate_request_1.validateRequest,
    __1.userController.updateCurrentUserPassword.bind(__1.userController),
]);
router.delete("/delete-me", __1.userController.deleteCurrentUser.bind(__1.userController));
router.use(auth_1.default.restrictTo("admin"));
router
    .route("/")
    .get(__1.userController.findAllUsers.bind(__1.userController))
    .post([
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("نام کاربر الزامی است")
        .isString()
        .withMessage("فرمت نام کاربر باید string باشد"),
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("ایمیل کاربر الزامی است")
        .isEmail()
        .withMessage("ایمیل وارد شده معتبر نیست"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("رمز عبور کاربر الزامی است")
        .isString()
        .withMessage("فرمت رمز عبور کاربر باید string باشد"),
    (0, express_validator_1.body)("passwordConfirmation")
        .notEmpty()
        .withMessage("تایید رمز عبور کاربر الزامی است")
        .isString()
        .withMessage("فرمت تایید رمز عبور کاربر باید string باشد"),
    (0, express_validator_1.body)("passwordConfirmation")
        .custom((value, { req }) => {
        if (value !== req.body.password)
            return false;
        return true;
    })
        .withMessage("رمز عبور و تایید رمز عبور باید یکسان باشد"),
    (0, express_validator_1.body)("active")
        .optional()
        .isBoolean()
        .withMessage("فرمت وضعیت کاربر معتبر نیست"),
    validate_request_1.validateRequest,
    __1.userController.createUser.bind(__1.userController),
]);
router
    .route("/get-users-count")
    .get(__1.userController.findUsersCountByDay.bind(__1.userController));
router
    .route("/:id")
    .get([__1.userController.findUserById.bind(__1.userController)])
    .delete([__1.userController.deleteUser.bind(__1.userController)])
    .patch([
    (0, express_validator_1.body)("name").optional().isString().withMessage("فرمت نام کاربر معتبر نیست"),
    (0, express_validator_1.body)("email")
        .optional()
        .isEmail()
        .withMessage("فرمت ایمیل کاربر معتبر نیست"),
    (0, express_validator_1.body)("photo")
        .optional()
        .isString()
        .withMessage("فرمت تصویر کاربر معتبر نیست"),
    (0, express_validator_1.body)("active")
        .optional()
        .isBoolean()
        .withMessage("فرمت وضعیت کاربر معتبر نیست"),
    validate_request_1.validateRequest,
    __1.userController.updateUser.bind(__1.userController),
]);
