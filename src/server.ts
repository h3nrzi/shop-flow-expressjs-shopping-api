import app from "./app";

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
	console.log(`🔹Server running on port ${port}`)
);

process.on("unhandledRejection", (err: Error) => {
	console.error("🔹Unhandled Rejection! Shutting down...");
	console.error("🔹Error Message:", err.message);
	server.close(() => process.exit(1));
});
