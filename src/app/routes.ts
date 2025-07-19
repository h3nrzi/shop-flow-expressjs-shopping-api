import { Express } from "express";
import { orderRouter } from "../core/orders/order.routes";
import { productRouter } from "../core/products/product.routes";
import { userRouter } from "../core/users/user.routes";
import { NotFoundError } from "../errors/not-found-error";
import { errorHandler } from "../middlewares/error-handler";
import { uploadRouter } from "../core/uploads/upload.routes";
import { viewRouter } from "../core/views/view.routes";
import swaggerSpec from "../swagger/config";
import swaggerUi from "swagger-ui-express";

module.exports = (app: Express) => {
	// Swagger UI route
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

	// Home route
	app.get("/", (req, res) => res.send("API is running..."));
	app.use("/admin", viewRouter);

	// API routes
	app.use("/api/products", productRouter);
	app.use("/api/users", userRouter);
	app.use("/api/uploads", uploadRouter);
	app.use("/api/orders", orderRouter);

	// Not found route
	app.all("*", () => {
		throw new NotFoundError("صفحه مورد نظر یافت نشد");
	});

	// Error handler
	app.use(errorHandler);
};
