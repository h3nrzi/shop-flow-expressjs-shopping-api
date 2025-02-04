import { RequestHandler } from "express";

export interface SignupRequestHandler<
	P = any,
	ResBody = any,
	ReqBody = {
		name: string;
		email: string;
		password: string;
		passwordConfirmation: string;
	},
	ReqQuery = any,
> extends RequestHandler<P, ResBody, ReqBody, ReqQuery> {}

export interface LoginRequestHandler<
	P = any,
	ResBody = any,
	ReqBody = {
		email: string;
		password: string;
	},
	ReqQuery = any,
> extends RequestHandler<P, ResBody, ReqBody, ReqQuery> {}

export interface ForgotPasswordRequestHandler<
	P = any,
	ResBody = any,
	ReqBody = {
		email: string;
	},
	ReqQuery = any,
> extends RequestHandler<P, ResBody, ReqBody, ReqQuery> {}

export interface ResetPasswordRequestHandler<
	P = any,
	ResBody = any,
	ReqBody = {
		password: string;
		passwordConfirmation: string;
	},
	ReqQuery = { resetToken?: string },
> extends RequestHandler<P, ResBody, ReqBody, ReqQuery> {}

export interface UpdateMeRequestHandler<
	P = any,
	ResBody = any,
	ReqBody = {
		name?: string;
		email?: string;
		photo?: string;
		password?: string; // Just only for type checking
		passwordConfirmation?: string; // Just only for type checking
	},
	ReqQuery = any,
> extends RequestHandler<P, ResBody, ReqBody, ReqQuery> {}

export interface UpdateMePasswordRequestHandler<
	P = any,
	ResBody = any,
	ReqBody = {
		passwordCurrent: string;
		password: string;
		passwordConfirmation: string;
	},
	ReqQuery = any,
> extends RequestHandler<P, ResBody, ReqBody, ReqQuery> {}
