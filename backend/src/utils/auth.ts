import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: number, username: string, email: string, role: string): string => {
  const payload = { id: userId, username, email, role };
  const secret = process.env.JWT_SECRET || 'default_secret';
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
};
