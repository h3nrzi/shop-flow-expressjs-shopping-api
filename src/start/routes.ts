import { Express } from "express";
import productRouter from "../routers/product";
import errorMiddleware from "../middlewares/error";
import errorController from "../controllers/error";
import viewRouter from "../routers/view";
import userRouter from "../routers/user";
import uploadRouter from "../routers/upload";
import orderRouter from "../routers/order";

module.exports = (app: Express) => {
	app.use("/admin", viewRouter);
	app.use("/api/products", productRouter);
	app.use("/api/users", userRouter);
	app.use("/api/upload", uploadRouter);
	app.use("/api/orders", orderRouter);

	// if (process.env.NODE_ENV === "production")
	//   app.get("*", (req, res) => res.sendFile(path.join(path.resolve(), "client", "dist", "index.html")));
	// else app.get("/", (req, res) => res.send("API is running..."));

	app.get("/", (req, res) => res.send("API is running..."));

	app.all("*", errorMiddleware.notFound);
	app.use(errorController.globalErrorHandler);
};
