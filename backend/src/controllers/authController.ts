import { Response, Request } from 'express';
import { User } from '../models';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
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
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

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
      
      return res.status(401).json({ 
        error: `邮箱或密码错误，剩余 ${remainingAttempts} 次尝试机会`,
        remainingAttempts,
      });
    }

    await user.update({ loginAttempts: 0, lockUntil: null });

    const token = generateToken(user.id, user.username, user.email, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userData = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};
