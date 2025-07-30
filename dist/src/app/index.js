"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
require("express-async-errors");
const app = require("express")();
process.on("uncaughtException", (err) => {
    console.error("🔹Uncaught Exception! Shutting down...");
    console.error("🔹Error Message:", err.message);
    process.exit(1);
});
require("./db")();
require("./config")(app);
require("./routes")(app);
exports.default = app;
