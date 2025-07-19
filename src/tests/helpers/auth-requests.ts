import request, { Response } from "supertest";
import app from "../../app";
import { IForgotPasswordDto } from "../../core/users/dtos/forgot.password.dto";
import { ILoginDto } from "../../core/users/dtos/login.dto";
import { IResetPasswordDto } from "../../core/users/dtos/reset.password.dto";
import { ISignupDto } from "../../core/users/dtos/signup.dto";

export const signup = async (
	body: ISignupDto,
): Promise<Response> => {
	return await request(app).post("/api/users/signup").send({
		name: body.name,
		email: body.email,
		password: body.password,
		passwordConfirmation: body.passwordConfirmation,
	});
};

export const login = async (
	body: ILoginDto,
): Promise<Response> => {
	return await request(app).post("/api/users/login").send({
		email: body.email,
		password: body.password,
	});
};

export const logout = async (
	cookie: string,
): Promise<Response> => {
	return await request(app)
		.post("/api/users/logout")
		.set("Cookie", cookie);
};

export const forgotPassword = async (
	body: IForgotPasswordDto,
): Promise<Response> => {
	return await request(app)
		.post("/api/users/forgot-password")
		.send({ email: body.email });
};

export const resetPassword = async (
	body: IResetPasswordDto,
	query: { resetToken: string },
): Promise<Response> => {
	return await request(app)
		.patch(
			`/api/users/reset-password?resetToken=${query.resetToken}`,
		)
		.send({
			password: body.password,
			passwordConfirmation: body.passwordConfirmation,
		});
};
