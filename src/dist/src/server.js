"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const port = process.env.PORT || 3000;
const server = app_1.default.listen(port, () => {
    console.log(`🔹Server running on port ${port}`);
});
process.on("unhandledRejection", (err) => {
    console.error("🔹Unhandled Rejection! Shutting down...");
    console.error("🔹Error Message:", err.message);
    server.close(() => process.exit(1));
});
