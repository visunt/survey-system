import { Response, Request } from 'express';
import { User } from '../models';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { verifyCaptcha } from '../utils/captcha';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;
const CAPTCHA_THRESHOLD = 3;

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, captchaId, captchaCode } = req.body;

    if (!captchaId || !captchaCode) {
      return res.status(400).json({ error: '请输入验证码', requireCaptcha: true });
    }

    if (!verifyCaptcha(captchaId, captchaCode)) {
      return res.status(400).json({ error: '验证码错误或已过期', requireCaptcha: true });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: '用户名已被使用' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      loginAttempts: 0,
    });

    const token = generateToken(user.id, user.username, user.email, user.role);

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误', details: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, captchaId, captchaCode } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 60000);
      return res.status(423).json({ 
        error: `账户已被锁定，请在 ${remainingTime} 分钟后重试`,
        locked: true,
        remainingTime,
      });
    }

    if (user.lockUntil && new Date(user.lockUntil) <= new Date()) {
      await user.update({ loginAttempts: 0, lockUntil: null });
    }

    const needCaptcha = (user.loginAttempts || 0) >= CAPTCHA_THRESHOLD;
    
    if (needCaptcha) {
      if (!captchaId || !captchaCode) {
        return res.status(400).json({ 
          error: '请输入验证码', 
          requireCaptcha: true,
          remainingAttempts: MAX_LOGIN_ATTEMPTS - (user.loginAttempts || 0),
        });
      }

      if (!verifyCaptcha(captchaId, captchaCode)) {
        return res.status(400).json({ 
          error: '验证码错误或已过期', 
          requireCaptcha: true,
          remainingAttempts: MAX_LOGIN_ATTEMPTS - (user.loginAttempts || 0),
        });
      }
    }

    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      const newAttempts = (user.loginAttempts || 0) + 1;
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_TIME);
        await user.update({ loginAttempts: newAttempts, lockUntil });
        return res.status(423).json({ 
          error: '登录失败次数过多，账户已被锁定15分钟',
          locked: true,
          remainingTime: 15,
        });
      }
      
      await user.update({ loginAttempts: newAttempts });
      
      const requireCaptcha = newAttempts >= CAPTCHA_THRESHOLD;
      
      return res.status(401).json({ 
        error: `邮箱或密码错误，剩余 ${remainingAttempts} 次尝试机会`,
        remainingAttempts,
        requireCaptcha,
      });
    }

    await user.update({ loginAttempts: 0, lockUntil: null });

    const token = generateToken(user.id, user.username, user.email, user.role);

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误', details: (error as Error).message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userData = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!userData) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: '服务器错误', details: (error as Error).message });
  }
};

export const checkCaptchaRequired = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.json({ requireCaptcha: false });
    }

    const user = await User.findOne({ where: { email: email as string } });
    
    if (!user) {
      return res.json({ requireCaptcha: false });
    }

    const requireCaptcha = (user.loginAttempts || 0) >= CAPTCHA_THRESHOLD;
    
    res.json({ requireCaptcha });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
};
