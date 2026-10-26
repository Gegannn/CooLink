import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate';
import { authenticate } from '../middlewares/authMiddleware';
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validateRequest(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', validateRequest(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/send-otp', validateRequest(sendOtpSchema), (req, res, next) =>
  authController.sendOtp(req, res, next)
);

router.post('/verify-otp', validateRequest(verifyOtpSchema), (req, res, next) =>
  authController.verifyOtp(req, res, next)
);

router.post('/refresh-token', (req, res, next) =>
  authController.refreshToken(req, res, next)
);

router.post('/logout', authenticate, (req, res, next) =>
  authController.logout(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req, res, next)
);

export default router;
