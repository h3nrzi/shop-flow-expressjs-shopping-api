"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeXSS = void 0;
const xss_1 = __importDefault(require("xss"));
const sanitizeObject = (data) => {
    if (typeof data === "string")
        return (0, xss_1.default)(data, { whiteList: {} });
    if (Array.isArray(data))
        return data.map(item => sanitizeObject(item));
    if (typeof data === "object" && data !== null) {
        const sanitizedObj = {};
        for (const key in data)
            if (data.hasOwnProperty(key))
                sanitizedObj[key] = sanitizeObject(data[key]);
        return sanitizedObj;
    }
    return data;
};
const sanitizeXSS = (req, res, next) => {
    req.params = sanitizeObject(req.params);
    req.query = sanitizeObject(req.query);
    req.body = sanitizeObject(req.body);
    next();
};
exports.sanitizeXSS = sanitizeXSS;
const securityMiddleware = { sanitizeXSS: exports.sanitizeXSS };
exports.default = securityMiddleware;
