import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);


export const sendVerificationCode = async (email: string, code: string) => {
    const { data, error } = await resend.emails.send({
        from: "EX-SERVER <notification@yassersaidi.com>",
        to: email,
        subject: "Your Verification Code",
        html: `
            <h2>Your verification code</h2>
            <h1>${code}</h1>
        `,
    });

    if (error) {
        return false
    }

    return true
}


export const sendResetPasswordCode = async (email: string, code: string) => {
    const { data, error } = await resend.emails.send({
        from: "EX-SERVER <notification@yassersaidi.com>",
        to: email,
        subject: "Reset Password Code",
        html: `
            <h2>Your Reset Password Code</h2>
            <h1>${code}</h1>
        `,
    });

    if (error) {
        return false
    }

    return true
}
