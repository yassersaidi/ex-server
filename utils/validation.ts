import { checkSchema } from "express-validator";

export const emailValidation = {
    email: {
        errorMessage: "Invalid Email",
        isEmail: true,
    }
};

export const passwordValidation = {
    password: {
        isLength: {
            errorMessage: "Password should be at least 8 chars",
            options: {
                min: 8
            }
        }
    }
};

export const usernameValidation = {
    username: {
        errorMessage: "Username is required",
        isString: true,
        isLength: {
            errorMessage: "Username should be at least 6 chars",
            options: {
                min: 6,
            }
        },
        matches: {
            options: /^[a-zA-Z0-9]+$/,
            errorMessage: "Username can only contain letters and numbers"
        }
    }
};

export const codeValidation = {
    code: {
        errorMessage: "Invalid Code",
        isLength: {
            options: {
                max: 6,
                min: 6
            }
        },
        matches: {
            options: /^\d{6}$/
        }
    }
};

export const checkLoginSchema = checkSchema({
    ...emailValidation,
    ...passwordValidation
})

export const checkRegisterSchema = checkSchema({
    ...emailValidation,
    ...passwordValidation,
    ...usernameValidation
})


export const checkVerificationCodeSchema = checkSchema({
    ...emailValidation,
    ...codeValidation
})

export const checkResetPasswordSchema = checkSchema({
    ...emailValidation,
    ...passwordValidation,
    ...codeValidation
})

export const checkUserSchema = checkSchema({
    ...emailValidation,
})

export const checkUsernameSchema = checkSchema({
    ...usernameValidation,
})

export const checkSearchQuerySchema = checkSchema({
    query: {
        in: ['query'],
        errorMessage: 'Search query is required and must be a string',
        isString: true,
        trim: true,
        isLength: {
            options: { min: 6 },
            errorMessage: 'Search query must be at least 6 character long'
        }
    }
})