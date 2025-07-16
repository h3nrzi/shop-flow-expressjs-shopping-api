import path from "node:path";
import express, { Express } from "express";
import morgan from "morgan";
import ms from "ms";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
const cookieParser = require("cookie-parser");
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../swagger/config";
import securityMiddleware from "../middlewares/security";
import { IUserDoc } from "../core/users/user.interface";

declare global {
	namespace Express {
		interface Request {
			user: IUserDoc;
		}
	}
}

module.exports = (app: Express) => {
	// Template Engine
	app.set("view engine", "pug");
	app.set("views", path.join(path.resolve(), "src", "views"));

	// Serving Static Files
	app.use(express.static(path.join(path.resolve(), "src", "public")));
	// app.use(express.static(path.join(path.resolve(), "client", "dist")))

	// Development Logging
	app.use(morgan("dev"));

	// Set security HTTP headers
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
					styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
					imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
				},
			},
		})
	);

	// CORS Configuration
	const corsOptions = {
		origin: [
			"http://localhost:5173",
			"http://localhost:3000",
			"https://azogeh.onrender.com",
		],
		methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true, // Allow cookies to be sent with requests
	};
	app.use(cors(corsOptions));

	// Limit requests
	const limiter = rateLimit({
		windowMs: ms("15m"),
		limit: 100,
		message:
			"درخواست های IP شما بسیار زیاد است، لطفاً یک ساعت دیگر دوباره امتحان کنید!",
	});
	if (process.env.NODE === "production") app.use("/api", limiter);

	// Request's Body parser
	app.use(express.json({ limit: "5mb" }));
	app.use(express.urlencoded({ extended: false }));

	// Request's Cookie parser
	app.use(cookieParser());

	// Data sanitization against NoSQL query injection
	app.use(mongoSanitize());

	// Data sanitization against XSS
	app.use(securityMiddleware.sanitizeXSS);

	// Protect against HTTP Parameter Pollution attacks
	app.use(
		hpp({
			whitelist: [
				"countInStock",
				"brand",
				"category",
				"rating",
				"numReviews",
				"price",
				"discount",
				"discountedPrice",
			],
		})
	);

	// Swagger UI route
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
