const request = require("supertest");
import app from "../../app";
import { IForgotPasswordDto } from "../../core/users/dtos/forgot.password.dto";
import { ILoginDto } from "../../core/users/dtos/login.dto";
import { IResetPasswordDto } from "../../core/users/dtos/reset.password.dto";
import { ISignupDto } from "../../core/users/dtos/signup.dto";

export const signup = async (user: ISignupDto) => {
	return await request(app).post("/api/users/signup").send({
		name: user.name,
		email: user.email,
		password: user.password,
		passwordConfirmation: user.passwordConfirmation,
	});
};

export const login = async (user: ILoginDto) => {
	return await request(app).post("/api/users/login").send({
		email: user.email,
		password: user.password,
	});
};

export const signout = async (cookie: string) => {
	return await request(app).post("/api/users/signout").set("Cookie", cookie);
};

export const forgotPassword = async (payload: IForgotPasswordDto) => {
	return await request(app).post("/api/users/forgot-password").send({ email: payload.email });
};

export const resetPassword = async (payload: IResetPasswordDto) => {
	return await request(app).post("/api/users/reset-password").send({
		password: payload.password,
		passwordConfirmation: payload.passwordConfirmation,
	});
};
