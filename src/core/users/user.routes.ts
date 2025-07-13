import express from "express";
import authMiddleware from "../../middlewares/auth";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import User from "./entities/user.entity";

const router = express.Router();
const userRepository = new UserRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// router.post("/signup", userController.signup.bind(userController));
// router.post("/login", authController.login);
// router.post("/logout", authController.logout);
// router.post("/forgot-password", authController.forgotPassword);
// router.patch("/reset-password", authController.resetPassword);

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
