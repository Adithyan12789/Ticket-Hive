import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

class EmailUtil {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    public async sendOtpEmail(email: string, otp: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('OTP sent successfully to:', email);
        } catch (error) {
            console.error('Error sending OTP email:', error);
            throw new Error('Failed to send OTP email');
        }
    }
}

export default new EmailUtil();
