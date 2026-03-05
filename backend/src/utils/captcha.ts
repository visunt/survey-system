import svgCaptcha from 'svg-captcha';

interface CaptchaData {
  text: string;
  svg: string;
}

const captchaStore = new Map<string, { text: string; expires: number }>();

export const generateCaptcha = (): CaptchaData & { captchaId: string } => {
  const captcha = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: true,
    background: '#f0f0f0',
    width: 120,
    height: 40,
  });

  const captchaId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  
  captchaStore.set(captchaId, {
    text: captcha.text.toLowerCase(),
    expires: Date.now() + 5 * 60 * 1000,
  });

  return {
    captchaId,
    text: captcha.text,
    svg: captcha.data,
  };
};

export const verifyCaptcha = (captchaId: string, inputText: string): boolean => {
  const stored = captchaStore.get(captchaId);
  
  if (!stored) {
    return false;
  }

  if (Date.now() > stored.expires) {
    captchaStore.delete(captchaId);
    return false;
  }

  const isValid = stored.text === inputText.toLowerCase();
  
  if (isValid) {
    captchaStore.delete(captchaId);
  }

  return isValid;
};

export const cleanupExpiredCaptchas = () => {
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (now > data.expires) {
      captchaStore.delete(id);
    }
  }
};

setInterval(cleanupExpiredCaptchas, 60 * 1000);
