import mongoose from "mongoose";

module.exports = () => {
	// Skip database connection in test environment
	// Tests will use mongodb-memory-server instead
	if (process.env.NODE_ENV === "test") {
		return;
	}
	
	mongoose
		.connect(process.env.MONGODB_URL as string)
		.then(conn =>
			console.log(
				`🔹MongoDB Connected: ${conn.connection.host}`,
			),
		);
};
