import swaggerJSDoc = require("swagger-jsdoc");

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Azooghe",
			version: "1.0.0",
			description: "This is the API documentation for Azooghe project",
		},
		// servers: [{ url: "http://localhost:3000" }],
	},
	apis: ["./src/swagger/*.yaml"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
