// ===============================================
// ============ Test Setup & Teardown ============
// ===============================================
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;

beforeAll(async () => {
	// Set environment variables first
	process.env.NODE_ENV = "test";
	process.env.JWT_SECRET = "asdf";
	process.env.JWT_EXPIRES_IN = "1h";

	// Close existing mongoose connection if open
	if (mongoose.connection.readyState !== 0) {
		await mongoose.connection.close();
	}

	// Initialize and connect to in-memory MongoDB
	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();
	await mongoose.connect(mongoUri);

	// Ensure connection is ready
	await mongoose.connection.asPromise();
});

beforeEach(async () => {
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
	await mongoose.connection.close();
	await mongo.stop();
});

// ===============================================
// ============ Mocks ============================
// ===============================================

jest.mock("@/utils/email", () => {
	return {
		sendEmail: jest.fn().mockResolvedValue(undefined),
	};
});
