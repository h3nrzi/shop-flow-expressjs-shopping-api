export interface IUpdateCurrentUserInfoDto {
	name?: string | null;
	email?: string | null;
	photo?: string | null;
	password?: string; // just for type checking
	passwordConfirmation?: string; // just for type checking
}
