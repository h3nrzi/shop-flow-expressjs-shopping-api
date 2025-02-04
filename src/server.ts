require("dotenv").config();
require("express-async-errors");
import { Express } from "express";

const app = require("express")() as Express;

process.on("uncaughtException", (err: Error) => {
	console.error("🔹Uncaught Exception! Shutting down...");
	console.error("🔹Error Message:", err.message);
	process.exit(1);
});

require("./start/db")();
require("./start/config")(app);
require("./start/routes")(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`🔹Server running on port ${port}`));

process.on("unhandledRejection", (err: Error) => {
	console.error("🔹Unhandled Rejection! Shutting down...");
	console.error("🔹Error Message:", err.message);
	server.close(() => process.exit(1));
});
