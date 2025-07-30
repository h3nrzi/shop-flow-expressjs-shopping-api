"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_routes_1 = require("../core/orders/order.routes");
const product_routes_1 = require("../core/products/product.routes");
const user_routes_1 = require("../core/users/user.routes");
const not_found_error_1 = require("../errors/not-found-error");
const error_handler_1 = require("../middlewares/error-handler");
const upload_routes_1 = require("../core/uploads/upload.routes");
const view_routes_1 = require("../core/views/view.routes");
const config_1 = __importDefault(require("../swagger/config"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
module.exports = (app) => {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(config_1.default));
    app.get("/", (req, res) => res.send("API is running..."));
    app.use("/admin", view_routes_1.viewRouter);
    app.use("/api/products", product_routes_1.productRouter);
    app.use("/api/users", user_routes_1.userRouter);
    app.use("/api/uploads", upload_routes_1.uploadRouter);
    app.use("/api/orders", order_routes_1.orderRouter);
    app.all("*", () => {
        throw new not_found_error_1.NotFoundError("صفحه مورد نظر یافت نشد");
    });
    app.use(error_handler_1.errorHandler);
};
