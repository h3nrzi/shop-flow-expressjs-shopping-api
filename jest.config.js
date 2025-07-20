module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.spec.ts"],
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},
	moduleFileExtensions: [
		"ts",
		"tsx",
		"js",
		"jsx",
		"json",
		"node",
	],
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
	testTimeout: 30000,
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
};
