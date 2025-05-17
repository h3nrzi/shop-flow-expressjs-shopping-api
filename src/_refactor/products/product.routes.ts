import { Router } from "express";
import authMiddleware from "../../middlewares/auth";

const router = Router();

router.get(
	"/:productId/reviews", // Route
	authMiddleware.protect // protect middleware
	// TODO: bind the controller method to the router
);

router.get(
	"/" // Route
	// TODO: bind the controller method to the router
);

router.get(
	"/:id" // Route
	// TODO: bind the controller method to the router
);

router.post(
	// Route
	"/", // Route
	// TODO: Validation rules
	// TODO: validateRequest is a middleware that validates the request
	authMiddleware.protect, // protect middleware
	authMiddleware.restrictTo("admin") // restrict to admin
	// TODO: bind the controller method to the router
);

router.patch(
	"/:id", // Route
	// TODO: Validation rules
	// TODO: validateRequest is a middleware that validates the request
	authMiddleware.protect, // protect middleware
	authMiddleware.restrictTo("admin") // restrict to admin
	// TODO: bind the controller method to the router
);

router.delete(
	"/:id", // Route
	authMiddleware.protect, // protect middleware
	authMiddleware.restrictTo("admin") // restrict to admin
	// TODO: bind the controller method to the router
);

export { router as productRouter };
