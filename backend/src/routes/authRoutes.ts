import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../validators/validationSchemas';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

export default router;
