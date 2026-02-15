// src/routes/authRoutes.js (updated with validation)

import express from 'express';
import { register, login, logout, getMe, checkAuth } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate, authValidations } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validate(authValidations.register), register);
router.post('/login', validate(authValidations.login), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/check', protect, checkAuth);

export default router;