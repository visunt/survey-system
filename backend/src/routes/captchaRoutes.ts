import { Router, Response } from 'express';
import { generateCaptcha } from '../utils/captcha';

const router = Router();

router.get('/captcha', (req, res: Response) => {
  const captchaData = generateCaptcha();
  
  res.json({
    captchaId: captchaData.captchaId,
    svg: captchaData.svg,
  });
});

export default router;
