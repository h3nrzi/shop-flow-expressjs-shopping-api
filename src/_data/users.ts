import bcrypt from "bcryptjs";

const users = [
	{
		name: "Hossein",
		email: "admin@gmail.com",
		password: bcrypt.hashSync("123456", 10),
		isAdmin: true,
	},
	{
		name: "Fariba",
		email: "fariba@gmail.com",
		password: bcrypt.hashSync("123456", 10),
		isAdmin: true,
	},
	{
		name: "Ali",
		email: "ali@gmail.com",
		password: bcrypt.hashSync("123456", 10),
		isAdmin: true,
	},
	{
		name: "Sara",
		email: "sara@gmail.com",
		password: bcrypt.hashSync("123456", 10),
		isAdmin: true,
	},
	{
		name: "Reza",
		email: "reza@gmail.com",
		password: bcrypt.hashSync("123456", 10),
		isAdmin: true,
	},
];

export default users;
