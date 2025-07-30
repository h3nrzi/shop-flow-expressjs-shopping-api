"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = __importDefault(require("express"));
const __1 = require("..");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const upload_1 = require("../../middlewares/upload");
const router = express_1.default.Router();
exports.uploadRouter = router;
router.post("/", [
    auth_1.default.protect,
    upload_1.uploadMiddleware.single("image"),
    __1.uploadController.uploadImage.bind(__1.uploadController),
]);
