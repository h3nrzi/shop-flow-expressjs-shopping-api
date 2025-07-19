import express from "express";
import { authController, userController } from "..";
import authMiddleware from "../../middlewares/auth";
import { body, param, query } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";

const router = express.Router();

router.post("/signup", [
	body("name").notEmpty().withMessage("نام کاربر الزامی است"),
	body("name").isString().withMessage("فرمت نام کاربر باید string باشد"),
	body("email").notEmpty().withMessage("ایمیل کاربر الزامی است"),
	body("email").isEmail().withMessage("ایمیل وارد شده معتبر نیست"),
	body("password").notEmpty().withMessage("رمز عبور کاربر الزامی است"),
	body("password").isString().withMessage("فرمت رمز عبور کاربر باید string باشد"),
	body("password").isLength({ min: 8 }).withMessage("رمز عبور کاربر باید حداقل 8 کاراکتر باشد"),
	body("passwordConfirmation").notEmpty().withMessage("تایید رمز عبور کاربر الزامی است"),
	body("passwordConfirmation").isString().withMessage("فرمت تایید رمز عبور کاربر باید string باشد"),
	body("passwordConfirmation")
		.custom((value, { req }) => {
			if (value !== req.body.password) return false;
			return true;
		})
		.withMessage("رمز عبور و تایید رمز عبور باید یکسان باشد"),
	validateRequest,
	authController.signup.bind(authController),
]);

router.post("/login", [
	body("email").notEmpty().withMessage("ایمیل کاربر الزامی است"),
	body("email").isEmail().withMessage("ایمیل وارد شده معتبر نیست"),
	body("password").notEmpty().withMessage("رمز عبور کاربر الزامی است"),
	body("password").isString().withMessage("فرمت رمز عبور کاربر باید string باشد"),
	validateRequest,
	authController.login.bind(authController),
]);

router.post("/logout", authController.logout.bind(authController));

router.post("/forgot-password", [
	body("email").notEmpty().withMessage("ایمیل کاربر الزامی است"),
	body("email").isEmail().withMessage("ایمیل وارد شده معتبر نیست"),
	validateRequest,
	authController.forgotPassword.bind(authController),
]);

router.patch("/reset-password", [
	body("password")
		.notEmpty()
		.withMessage("رمز عبور کاربر الزامی است")
		.isString()
		.withMessage("فرمت رمز عبور کاربر باید string باشد"),
	body("passwordConfirmation")
		.notEmpty()
		.withMessage("تایید رمز عبور کاربر الزامی است")
		.isString()
		.withMessage("فرمت تایید رمز عبور کاربر باید string باشد")
		.custom((value, { req }) => {
			if (value !== req.body.password) return false;
			return true;
		})
		.withMessage("رمز عبور و تایید رمز عبور باید یکسان باشد"),
	query("resetToken")
		.notEmpty()
		.withMessage("ریست توکن کاربر الزامی است")
		.isString()
		.withMessage("ریست توکن کاربر باید string باشد"),
	validateRequest,
	authController.resetPassword.bind(authController),
]);

/************************************************************************
 *********  @description Protect all routes below to users only *********
 ************************************************************************/
router.use(authMiddleware.protect);

router.get("/get-me", userController.getCurrentUser.bind(userController));

router.patch("/update-me", [
	body("name").optional().isString().withMessage("فرمت نام کاربر معتبر نیست"),
	body("email").optional().isEmail().withMessage("فرمت ایمیل کاربر معتبر نیست"),
	body("photo").optional().isString().withMessage("فرمت تصویر کاربر معتبر نیست"),
	validateRequest,
	userController.updateCurrentUserInfo.bind(userController),
]);

router.patch("/update-me-password", [
	body("passwordCurrent").isString().withMessage("رمز عبور فعلی کاربر الزامی است"),
	body("password").isString().withMessage("رمز عبور کاربر الزامی است"),
	body("passwordConfirmation").isString().withMessage("تایید رمز عبور کاربر الزامی است"),
	validateRequest,
	userController.updateCurrentUserPassword.bind(userController),
]);

router.delete("/delete-me", userController.deleteCurrentUser.bind(userController));

/************************************************************************
 *********  @description Restrict all routes below to admin only *********
 ************************************************************************/
router.use(authMiddleware.restrictTo("admin"));

router
	.route("/")
	.get(userController.findAllUsers.bind(userController))
	.post([
		body("name").notEmpty().withMessage("نام کاربر الزامی است"),
		body("name").isString().withMessage("فرمت نام کاربر باید string باشد"),
		body("email").isEmail().withMessage("ایمیل وارد شده معتبر نیست"),
		body("password").isString().withMessage("رمز عبور کاربر الزامی است"),
		body("passwordConfirmation").isString().withMessage("تایید رمز عبور کاربر الزامی است"),
		body("active").optional().isBoolean().withMessage("فرمت وضعیت کاربر معتبر نیست"),
		validateRequest,
		userController.createUser.bind(userController),
	]);

router.route("/get-users-count").get(userController.findUsersCountByDay.bind(userController));

router
	.route("/:id")
	.get([
		param("id").isMongoId().withMessage("شناسه کاربر معتبر نیست"),
		validateRequest,
		userController.findUserById.bind(userController),
	])
	.delete([
		param("id").isMongoId().withMessage("شناسه کاربر معتبر نیست"),
		validateRequest,
		userController.deleteUser.bind(userController),
	])
	.patch([
		param("id").isMongoId().withMessage("شناسه کاربر معتبر نیست"),
		body("name").optional().isString().withMessage("فرمت نام کاربر معتبر نیست"),
		body("email").optional().isEmail().withMessage("فرمت ایمیل کاربر معتبر نیست"),
		body("photo").optional().isString().withMessage("فرمت تصویر کاربر معتبر نیست"),
		body("active").optional().isBoolean().withMessage("فرمت وضعیت کاربر معتبر نیست"),
		validateRequest,
		userController.updateUser.bind(userController),
	]);

export { router as userRouter };
