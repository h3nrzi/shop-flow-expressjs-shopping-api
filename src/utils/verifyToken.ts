import jwt from "jsonwebtoken";

const verifyToken = (token: string) => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
			if (err) return reject(err);
			resolve(decoded);
		});
	});
};

export default verifyToken;
