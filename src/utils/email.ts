import nodemailer from "nodemailer";

const sendEmail = async (email: string, resetUrl: string, subject: string) => {
	const { EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD } =
		process.env;

	const transporter = nodemailer.createTransport({
		service: "Gmail",
		host: EMAIL_HOST,
		port: +EMAIL_PORT!,
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
		// text: resetUrl,
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

	await transporter.sendMail(mailOptions);
};

export default sendEmail;
