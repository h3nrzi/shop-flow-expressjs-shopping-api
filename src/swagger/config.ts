import fs from "fs";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const base = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./base.json"), "utf8"));

const options: swaggerJSDoc.Options = {
	definition: base,
	apis: ["./src/swagger/*.yaml"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
