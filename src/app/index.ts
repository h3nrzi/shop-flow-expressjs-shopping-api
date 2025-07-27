require("dotenv").config();
require("express-async-errors");
import { Express } from "express";

const app = require("express")() as Express;

process.on("uncaughtException", (err: Error) => {
	console.error("🔹Uncaught Exception! Shutting down...");
	console.error("🔹Error Message:", err.message);
	process.exit(1);
});

// Initialize database connection
require("./db")();

// Configure app
require("./config")(app);
require("./routes")(app);

export default app;
