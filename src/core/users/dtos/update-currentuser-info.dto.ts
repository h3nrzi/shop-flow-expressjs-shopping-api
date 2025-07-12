export interface IUpdateCurrentUserInfoDto {
	name?: string;
	email?: string;
	photo?: string;
	password?: string; // for type checking
	passwordConfirmation?: string; // for type checking
}
