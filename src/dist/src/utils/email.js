"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (email, resetUrl, subject) => __awaiter(void 0, void 0, void 0, function* () {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD, } = process.env;
    const transporter = nodemailer_1.default.createTransport({
        service: "Gmail",
        host: EMAIL_HOST,
        port: +EMAIL_PORT,
        secure: true,
        auth: {
            user: EMAIL_USERNAME,
            pass: EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: "Hossein Rezaei <rezaeig22@gmail.com>",
        to: email,
        subject: subject,
        html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; color: #333;">
        <h1 style="color: #0056b3;">درخواست بازیابی رمز عبور</h1>
        <p style="font-size: 16px;">کاربر گرامی،</p>
        <p style="font-size: 16px;">
          شما درخواست بازیابی رمز عبور خود را ثبت کرده‌اید. برای تغییر رمز عبور، روی دکمه زیر کلیک کنید. 
          در صورت عدم درخواست، این ایمیل را نادیده بگیرید.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: bold;
            color: #ffffff;
            background-color: #28a745;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
          " onmouseover="this.style.backgroundColor='#218838'" onmouseout="this.style.backgroundColor='#28a745'">
            بازیابی رمز عبور
          </a>
        </div>
        <p style="font-size: 14px; font-weight: bold; color: #666;">
          لینک بازیابی تا 10 دقیقه دیگر معتبر است.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          اگر با این درخواست مشکلی دارید، با تیم پشتیبانی ما تماس بگیرید.
        </p>
      </div>
    `,
    };
    yield transporter.sendMail(mailOptions);
});
exports.sendEmail = sendEmail;
