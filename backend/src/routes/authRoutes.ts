import { Router } from 'express';
import { register, login, getProfile, checkCaptchaRequired } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.get('/check-captcha', checkCaptchaRequired);

export default router;
