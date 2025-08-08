import jwt from "jsonwebtoken";
import { NotAuthorizedError } from "../errors/not-authorized-error";

const verifyToken = (token: string) => {
	return new Promise((resolve) => {
		jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
			if (err) throw new NotAuthorizedError("توکن معتبر نیست");
			resolve(decoded);
		});
	});
};

export default verifyToken;
