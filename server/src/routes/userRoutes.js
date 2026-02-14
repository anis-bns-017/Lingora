import express from 'express';
import {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  getUserStats,
  updateAvatar,
  updateLanguages
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validate, userValidations } from '../middleware/validation.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);
router.get('/:id/stats', getUserStats);

// Protected routes
router.use(protect);

router.put('/profile', validate(userValidations.updateProfile), updateProfile);
router.put('/languages', updateLanguages);
router.post('/avatar', upload.single('avatar'), updateAvatar);
router.post('/:id/follow', followUser);
router.post('/:id/unfollow', unfollowUser);

export default router;