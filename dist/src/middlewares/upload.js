"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const bad_request_error_1 = require("../errors/bad-request-error");
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, callback) => {
    const fileTypes = /jpg|jpeg|png|webp/;
    const extname = fileTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (!extname || !mimetype) {
        callback(new bad_request_error_1.BadRequestError("تصویر فقط پشتیبانی میشود!"));
    }
    callback(null, true);
};
const upload = (0, multer_1.default)({ storage, fileFilter });
exports.uploadMiddleware = upload;
