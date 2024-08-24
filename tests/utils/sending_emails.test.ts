import { sendVerificationCode } from "../../utils/sendEmails"
jest.mock('../../utils/sendEmails', () => ({
    sendVerificationCode: jest.fn().mockResolvedValue(true)
}));

describe("Sending Verification Code", () => {
    test("Should return: True", async () => {
        const isSent = await sendVerificationCode("hello@mail.com","451234")
        expect(isSent).toBe(true)
    })
})