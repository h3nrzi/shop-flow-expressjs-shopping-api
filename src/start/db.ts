import mongoose from "mongoose";

module.exports = () => {
	mongoose
		.connect(process.env.MONGODB_URL as string)
		.then(conn => console.log(`🔹MongoDB Connected: ${conn.connection.host}`));
};
