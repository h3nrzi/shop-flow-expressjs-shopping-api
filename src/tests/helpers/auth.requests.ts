import request, { Response } from "supertest";
import app from "../../app";
import { IForgotPasswordDto } from "../../core/users/dtos/forgot.password.dto";
import { ILoginDto } from "../../core/users/dtos/login.dto";
import { IResetPasswordDto } from "../../core/users/dtos/reset.password.dto";
import { ISignupDto } from "../../core/users/dtos/signup.dto";

export const signup = async (user: ISignupDto): Promise<Response> => {
	return await request(app).post("/api/users/signup").send({
		name: user.name,
		email: user.email,
		password: user.password,
		passwordConfirmation: user.passwordConfirmation,
	});
};

export const login = async (user: ILoginDto): Promise<Response> => {
	return await request(app).post("/api/users/login").send({
		email: user.email,
		password: user.password,
	});
};

export const logout = async (cookie: string): Promise<Response> => {
	return await request(app).post("/api/users/logout").set("Cookie", cookie);
};

export const forgotPassword = async (payload: IForgotPasswordDto): Promise<Response> => {
	return await request(app).post("/api/users/forgot-password").send({ email: payload.email });
};

export const resetPassword = async (payload: IResetPasswordDto): Promise<Response> => {
	return await request(app).post("/api/users/reset-password").send({
		password: payload.password,
		passwordConfirmation: payload.passwordConfirmation,
	});
};
