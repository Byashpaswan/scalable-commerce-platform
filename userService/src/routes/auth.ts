import { Router } from 'express';
import { register, login, logout, refreshToken, forgotPassword, resetPassword, verifyEmail } from '../controller/auth/authController';
import { validate } from '../middlware/validate';
import { registerSchema, loginSchema } from '../utils/validators';

const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/logout', logout);
authRouter.post('/refresh-token', refreshToken);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/verify-email', verifyEmail);

export default authRouter;
