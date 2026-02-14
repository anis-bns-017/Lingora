// src/routes/roomRoutes.js (updated with validation)

import express from 'express';
import {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  updateParticipantRole,
  getRoomParticipants,
  getActiveRooms,
  searchRooms
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, roomValidations } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getRooms);
router.get('/active', getActiveRooms);
router.get('/search', searchRooms);
router.get('/:id', getRoom);
router.get('/:id/participants', getRoomParticipants);

// Protected routes
router.use(protect); // All routes below this require authentication

router.post('/', validate(roomValidations.createRoom), createRoom);
router.post('/:id/join', validate(roomValidations.joinRoom), joinRoom);
router.post('/:id/leave', leaveRoom);
router.put('/:id', updateRoom);
router.put('/:id/participants/:userId/role', validate(roomValidations.updateParticipantRole), updateParticipantRole);
router.delete('/:id', deleteRoom);

export default router;