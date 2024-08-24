import { checkSchema } from "express-validator";

export const checkLoginSchema = checkSchema({
    email: {
        errorMessage: "Invalid Email",
        isEmail: true,
    },
    password: {
        isLength: {
            errorMessage: "Password should be at least 8 chars",
            options: {
                min: 8
            }
        }
    }
})

export const checkRegisterSchema = checkSchema({
    email: {
        errorMessage: "Invalid Email",
        isEmail: true,
    },
    password: {
        isLength: {
            errorMessage: "Password should be at least 8 chars",
            options: {
                min: 8
            }
        }
    },
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
            options: /[a-zA-Z]/,
            errorMessage: "Name must contain at least one alphabetical character"
        }
    }
})

export const checkUserSchema = checkSchema({
    email: {
        errorMessage: "Invalid Email",
        isEmail: true,
    },
})

export const checkVerificationCodeSchema = checkSchema({
    email: {
        errorMessage: "Invalid Email",
        isEmail: true,
    },
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
})

export const checkResetPasswordSchema = checkSchema({
    email: {
        errorMessage: "Invalid Email",
        isEmail: true,
    },
    password: {
        isLength: {
            errorMessage: "Password should be at least 8 chars",
            options: {
                min: 8
            }
        }
    },
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
})