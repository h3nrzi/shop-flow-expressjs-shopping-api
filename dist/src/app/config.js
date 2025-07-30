"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const ms_1 = __importDefault(require("ms"));
const node_path_1 = __importDefault(require("node:path"));
const security_1 = __importDefault(require("../middlewares/security"));
const cookieParser = require("cookie-parser");
module.exports = (app) => {
    app.set("view engine", "pug");
    app.set("views", node_path_1.default.join(node_path_1.default.resolve(), "src", "views"));
    app.use(express_1.default.static(node_path_1.default.join(node_path_1.default.resolve(), "src", "public")));
    if (process.env.NODE_ENV === "development") {
        app.use((0, morgan_1.default)("dev"));
    }
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
                styleSrc: [
                    "'self'",
                    "https://cdn.jsdelivr.net",
                    "'unsafe-inline'",
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https://res.cloudinary.com",
                ],
            },
        },
    }));
    const corsOptions = {
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://azogeh.onrender.com",
        ],
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    };
    app.use((0, cors_1.default)(corsOptions));
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: (0, ms_1.default)("15m"),
        limit: 100,
        message: "درخواست های IP شما بسیار زیاد است، لطفاً یک ساعت دیگر دوباره امتحان کنید!",
    });
    if (process.env.NODE === "production")
        app.use("/api", limiter);
    app.use(express_1.default.json({ limit: "5mb" }));
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use((0, express_mongo_sanitize_1.default)());
    app.use(security_1.default.sanitizeXSS);
    app.use((0, hpp_1.default)({
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
    }));
};
