"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const ms_1 = __importDefault(require("ms"));
const createSendTokenAndResponse = (user, statusCode, res) => {
    const accessToken = user.signToken();
    const refreshToken = user.signRefreshToken();
    res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: (0, ms_1.default)(process.env.JWT_COOKIE_EXPIRES_IN),
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: (0, ms_1.default)(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN),
    });
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + (0, ms_1.default)(process.env.JWT_REFRESH_EXPIRES_IN));
    user.save({ validateBeforeSave: false });
    return res
        .status(statusCode)
        .header("x-auth-token", accessToken)
        .json({
        status: "success",
        data: {
            user: lodash_1.default.pick(user, [
                "id",
                "name",
                "email",
                "role",
                "photo",
            ]),
        },
    });
};
exports.default = createSendTokenAndResponse;
