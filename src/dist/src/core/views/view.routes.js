"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewRouter = void 0;
const express_1 = __importDefault(require("express"));
const __1 = require("..");
const view_1 = __importDefault(require("../../middlewares/view"));
const router = express_1.default.Router();
exports.viewRouter = router;
router.get("/login", __1.viewController.getLoginPage.bind(__1.viewController));
router.use(view_1.default.isLoggedIn);
router.get("/", __1.viewController.getHomePage.bind(__1.viewController));
router.get("/product-edit/:id", __1.viewController.getEditProductPage.bind(__1.viewController));
router.get("/product-create", __1.viewController.getCreateProductPage.bind(__1.viewController));
