"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
module.exports = () => {
    if (process.env.NODE_ENV === "test") {
        return Promise.resolve();
    }
    return mongoose_1.default
        .connect(process.env.MONGODB_URL)
        .then((conn) => console.log(`🔹MongoDB Connected: ${conn.connection.host}`));
};
