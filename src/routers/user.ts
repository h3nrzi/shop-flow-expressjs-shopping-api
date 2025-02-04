import express from "express";
import userController from "../controllers/user";
import authController from "../controllers/auth";
import authMiddleware from "../middlewares/auth";

const userRouter = express.Router();

//////////// @access PUBLIC ////////////

userRouter.post("/signup", authController.signup);
userRouter.post("/login", authController.login);
userRouter.post("/logout", authController.logout);
userRouter.post("/forgot-password", authController.forgotPassword);
userRouter.patch("/reset-password", authController.resetPassword);

//////////// @access USERS ////////////

userRouter.use(authMiddleware.protect);

userRouter.get("/get-me", userController.getMe);
userRouter.patch("/update-me", userController.updateMe);
userRouter.patch("/update-me-password", userController.updateMePassword);
userRouter.delete("/delete-me", userController.deleteMe);

//////////// @access ADMIN ////////////

userRouter.use(authMiddleware.restrictTo("admin"));

userRouter.get("/get-users-count", userController.getUsersCountByDay);

userRouter
	//
	.route("/")
	.get(userController.getAll)
	.post(userController.createOne);

userRouter
	//
	.route("/:id")
	.get(userController.getOne)
	.delete(userController.deleteOne)
	.patch(userController.updateOne);

export default userRouter;
