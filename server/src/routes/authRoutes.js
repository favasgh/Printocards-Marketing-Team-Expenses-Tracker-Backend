import { Router } from 'express';
import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import validateRequest from '../middleware/validateRequest.js';
import { loginSchema, registerSchema } from '../validators/authValidators.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.get('/profile', authenticate, getProfile);

export default router;

