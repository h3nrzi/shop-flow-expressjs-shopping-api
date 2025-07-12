require("dotenv").config();
require("colors");

// Models
import Product from "../core/products/entities/product.entity";

// Data
import products from "./products";

// Connect to DataBase
require("../start/db")();

const importData = async () => {
	try {
		await Product.insertMany(products);

		// @ts-ignore
		console.log("Data Imported!".green.inverse);
	} catch (err) {
		// @ts-ignore
		console.log(`${err}`.red.inverse);
	}
};

const destroyData = async () => {
	try {
		await Product.deleteMany();

		// @ts-ignore
		console.log("Data Destroyed!".green.inverse);
	} catch (err) {
		// @ts-ignore
		console.log(`${err}`.red.inverse);
	}
};

const command = process.argv[2];
if (command === "-i") importData().then(() => process.exit(1));
if (command === "-d") destroyData().then(() => process.exit(1));
