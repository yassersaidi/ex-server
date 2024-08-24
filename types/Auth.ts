export type LoginType = {
    email: string,
    password: string
}

export type RegisterType = {
    email: string,
    password: string,
    username: string
}

export interface ResetPasswordType extends LoginType {
    code: string
}