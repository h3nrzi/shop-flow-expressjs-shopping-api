import fs from "fs";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const basePath = path.resolve(__dirname, "./base.json");
const baseFile = fs.readFileSync(basePath, "utf8");
const swaggerDefinition = JSON.parse(baseFile);

const options: swaggerJSDoc.Options = {
	definition: swaggerDefinition,
	apis: ["./src/swagger/**/*.yaml"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
