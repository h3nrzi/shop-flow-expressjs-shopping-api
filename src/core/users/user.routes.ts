import express from "express";
import authMiddleware from "../../middlewares/auth";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { UserRepository } from "./user.repository";
import User from "./user.entity";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";

const router = express.Router();

const userRepository = new UserRepository(User);
const userService = new UserService(userRepository);
const authService = new AuthService(userRepository);
const userController = new UserController(userService);
const authController = new AuthController(authService);

router.post("/signup", authController.signup.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/logout", authController.logout.bind(authController));
router.post(
	"/forgot-password",
	authController.forgotPassword.bind(authController)
);
router.patch(
	"/reset-password",
	authController.resetPassword.bind(authController)
);

/**
 ********************************************************************************
 ************* @description Protect all routes below to users only *************
 ********************************************************************************
 */

router.use(authMiddleware.protect);

router.get("/get-me", userController.getCurrentUser.bind(userController));
router.patch(
	"/update-me",
	userController.updateCurrentUserInfo.bind(userController)
);
router.patch(
	"/update-me-password",
	userController.updateCurrentUserPassword.bind(userController)
);
router.delete(
	"/delete-me",
	userController.deleteCurrentUser.bind(userController)
);

/**
 ********************************************************************************
 ************* @description Restrict all routes below to admin only *************
 ********************************************************************************
 */

router.use(authMiddleware.restrictTo("admin"));

router.route("/").get(userController.findAllUsers.bind(userController)).post(
	// TODO: Validation rules
	// TODO: validateRequest
	userController.createUser.bind(userController)
);

router
	.route("/get-users-count")
	.get(userController.findUsersCountByDay.bind(userController));

router
	.route("/:id")
	.get(userController.findUserById.bind(userController))
	.delete(userController.deleteUser.bind(userController))
	.patch(
		// TODO: Validation rules
		// TODO: validateRequest
		userController.updateUser.bind(userController)
	);

export { router as userRouter };
