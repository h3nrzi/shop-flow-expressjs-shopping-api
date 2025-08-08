"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
const ms_1 = __importDefault(require("ms"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
    },
    photo: { type: String },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    active: { type: Boolean, default: true },
    password: {
        type: String,
        select: false,
        minLength: 8,
        required: true,
    },
    passwordConfirmation: {
        type: String,
        minLength: 8,
        validate: {
            validator: function (value) {
                return value === this.password;
            },
        },
        required: true,
    },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    refreshToken: { type: String },
    refreshTokenExpires: { type: Date },
}, {
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            delete ret._id;
            delete ret.__v;
            delete ret.passwordResetExpires;
            delete ret.passwordResetToken;
            delete ret.refreshToken;
            delete ret.refreshTokenExpires;
            return ret;
        },
    },
    toObject: { virtuals: true },
    timestamps: true,
});
userSchema.methods.signToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
userSchema.methods.signRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
};
userSchema.methods.correctPassword = function (candidate_password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(candidate_password, this.password);
    });
};
userSchema.methods.changePasswordAfter = function (jwtTimeStamp) {
    return this.passwordChangedAt
        ? this.passwordChangedAt.getTime() / 1000 >= jwtTimeStamp
        : false;
};
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = node_crypto_1.default.randomBytes(32).toString("hex");
    this.passwordResetToken = node_crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires =
        Date.now() + (0, ms_1.default)(process.env.PASSWORD_RESET_EXPIRES_IN);
    return resetToken;
};
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password")) {
            this.password = yield bcryptjs_1.default.hash(this.password, 12);
            this.passwordConfirmation = undefined;
            return next();
        }
        return next();
    });
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password") && !this.isNew) {
            let currentTime = new Date();
            currentTime.setSeconds(currentTime.getSeconds() - 2);
            this.passwordChangedAt = currentTime;
            return next();
        }
        return next();
    });
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.User = User;
