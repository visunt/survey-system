import { Response, Request } from 'express';
import { User, PasswordReset } from '../models';
import { hashPassword, comparePassword } from '../utils/auth';
import { sendPasswordResetEmail } from '../utils/email';
import crypto from 'crypto';

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: '该邮箱未注册' });
    }

    await PasswordReset.destroy({ where: { email } });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordReset.create({
      email,
      token,
      expiresAt,
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`;

    try {
      await sendPasswordResetEmail(email, token, resetUrl);
      res.json({ message: '重置密码邮件已发送，请查收邮箱' });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      res.status(500).json({ error: '邮件发送失败，请检查邮箱配置' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const resetRecord = await PasswordReset.findOne({ where: { token } });

    if (!resetRecord) {
      return res.status(400).json({ error: '无效的重置链接' });
    }

    if (new Date() > resetRecord.expiresAt) {
      await PasswordReset.destroy({ where: { token } });
      return res.status(400).json({ error: '重置链接已过期，请重新申请' });
    }

    const user = await User.findOne({ where: { email: resetRecord.email } });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const hashedPassword = await hashPassword(password);
    await user.update({ password: hashedPassword });

    await PasswordReset.destroy({ where: { email: resetRecord.email } });

    res.json({ message: '密码重置成功，请使用新密码登录' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const resetRecord = await PasswordReset.findOne({ where: { token } });

    if (!resetRecord) {
      return res.status(400).json({ valid: false, error: '无效的重置链接' });
    }

    if (new Date() > resetRecord.expiresAt) {
      await PasswordReset.destroy({ where: { token } });
      return res.status(400).json({ valid: false, error: '重置链接已过期' });
    }

    res.json({ valid: true, email: resetRecord.email });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};
