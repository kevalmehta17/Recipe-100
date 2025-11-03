import express from 'express';
import { getMyProfile, updateMyProfile, getUserProfile, getUserRecipes } from '../controllers/profile.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes (need authentication)
router.get('/me', protectRoute, getMyProfile);
router.put('/me', protectRoute, updateMyProfile);

// Public routes (no authentication needed - anyone can view)
router.get('/user/:userId', getUserProfile);
router.get('/user/:userId/recipes', getUserRecipes);

export default router;