"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.verifyRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const not_authorized_error_1 = require("../errors/not-authorized-error");
const verifyRefreshToken = (token) => {
    return new Promise((resolve) => {
        jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err)
                throw new not_authorized_error_1.NotAuthorizedError("توکن تازه‌سازی معتبر نیست");
            resolve(decoded);
        });
    });
};
exports.verifyRefreshToken = verifyRefreshToken;
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
};
exports.generateRefreshToken = generateRefreshToken;
