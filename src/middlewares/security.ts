import { RequestHandler } from "express";
import xss from "xss";

const sanitizeObject = (data: any): any => {
	if (typeof data === "string") return xss(data, { whiteList: {} });

	if (Array.isArray(data)) return data.map(item => sanitizeObject(item));

	if (typeof data === "object" && data !== null) {
		const sanitizedObj: any = {};
		for (const key in data)
			if (data.hasOwnProperty(key))
				sanitizedObj[key] = sanitizeObject(data[key]);
		return sanitizedObj;
	}

	return data;
};

export const sanitizeXSS: RequestHandler = (req, res, next) => {
	req.params = sanitizeObject(req.params);
	req.query = sanitizeObject(req.query);
	req.body = sanitizeObject(req.body);

	next();
};

const securityMiddleware = { sanitizeXSS };
export default securityMiddleware;
