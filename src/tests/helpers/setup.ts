import { sign } from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// ===============================================
// ============ Test Setup & Teardown ============
// ===============================================

let mongo: MongoMemoryServer;

beforeAll(async () => {
	// Set JWT key for testing
	process.env.JWT_KEY = "asdf";

	// Close existing mongoose connection if open
	if (mongoose.connection.readyState !== 0) {
		await mongoose.connection.close();
	}

	// Initialize and connect to in-memory MongoDB
	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();
	await mongoose.connect(mongoUri);
});

beforeEach(async () => {
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
	if (mongo) await mongo.stop();
	if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
});

// ===============================================
// ============ Helper Functions =================
// ===============================================

declare global {
	var signup: () => string;
}

global.signup = (): string => {
	const payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: "test@test.com",
	};

	const token = sign(payload, process.env.JWT_KEY!);
	const cookie = { jwt: token };

	return JSON.stringify(cookie);
};
