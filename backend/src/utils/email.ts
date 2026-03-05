import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"问卷平台" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email: string, resetToken: string, resetUrl: string): Promise<void> => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #667eea; text-align: center;">重置密码</h2>
      <p>您好，</p>
      <p>我们收到了重置您账户密码的请求。请点击下方按钮重置密码：</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}?token=${resetToken}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 12px 30px; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  display: inline-block;">
          重置密码
        </a>
      </div>
      <p>或者复制以下链接到浏览器：</p>
      <p style="word-break: break-all; color: #667eea;">${resetUrl}?token=${resetToken}</p>
      <p style="color: #999; font-size: 14px;">此链接将在 1 小时后失效。</p>
      <p style="color: #999; font-size: 14px;">如果您没有请求重置密码，请忽略此邮件。</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">问卷平台 - 专业的在线问卷调查系统</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: '重置您的密码 - 问卷平台',
    html,
  });
};
