import { body, validationResult } from 'express-validator';
import createError from 'http-errors';

// Validation middleware
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      [err.path]: err.msg
    }));

    throw createError(400, { errors: extractedErrors });
  };
};

// Auth validations
export const authValidations = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage('Password must contain at least one letter and one number'),
    
    body('nativeLanguage')
      .notEmpty()
      .withMessage('Native language is required')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

// Room validations
export const roomValidations = {
  createRoom: [
    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Room name must be between 3 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    
    body('language')
      .notEmpty()
      .withMessage('Language is required'),
    
    body('topic')
      .notEmpty()
      .withMessage('Topic is required'),
    
    body('isPrivate')
      .optional()
      .isBoolean()
      .withMessage('isPrivate must be a boolean'),
    
    body('password')
      .if(body('isPrivate').equals('true'))
      .notEmpty()
      .withMessage('Password is required for private rooms')
      .isLength({ min: 4 })
      .withMessage('Password must be at least 4 characters'),
    
    body('maxParticipants')
      .optional()
      .isInt({ min: 2, max: 50 })
      .withMessage('Max participants must be between 2 and 50')
  ],

  joinRoom: [
    body('password')
      .optional({ nullable: true }) // This allows null, undefined, or empty
      .isString()
      .withMessage('Password must be a string')
      .custom((value) => {
        // If it's a private room, password must be provided
        // You might need to access the room data here
        return true;
      })
  ],

  updateParticipantRole: [
    body('role')
      .isIn(['speaker', 'listener'])
      .withMessage('Role must be either speaker or listener')
  ]
};

// User validations
export const userValidations = {
  updateProfile: [
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio cannot exceed 500 characters'),
    
    body('learningLanguages')
      .optional()
      .isArray()
      .withMessage('Learning languages must be an array'),
    
    body('learningLanguages.*.language')
      .if(body('learningLanguages').exists())
      .notEmpty()
      .withMessage('Language is required'),
    
    body('learningLanguages.*.level')
      .if(body('learningLanguages').exists())
      .isIn(['beginner', 'intermediate', 'advanced', 'fluent'])
      .withMessage('Invalid language level')
  ]
};

// Message validations
export const messageValidations = {
  sendMessage: [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Message content cannot be empty')
      .isLength({ max: 1000 })
      .withMessage('Message cannot exceed 1000 characters'),
    
    body('type')
      .optional()
      .isIn(['text', 'system', 'correction'])
      .withMessage('Invalid message type'),
    
    body('correction')
      .optional()
      .isObject()
      .withMessage('Correction must be an object')
  ]
};