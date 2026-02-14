import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTimes, FaLock, FaGlobe } from 'react-icons/fa';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const roomSchema = z.object({
  name: z.string()
    .min(3, 'Room name must be at least 3 characters')
    .max(100, 'Room name cannot exceed 100 characters'),
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  language: z.string().min(1, 'Please select a language'),
  topic: z.string().min(1, 'Please select a topic'),
  isPrivate: z.boolean().default(false),
  password: z.string().optional(),
  maxParticipants: z.number()
    .min(2, 'Minimum 2 participants')
    .max(50, 'Maximum 50 participants')
    .default(20),
  tags: z.string().optional()
}).refine((data) => {
  if (data.isPrivate && !data.password) {
    return false;
  }
  return true;
}, {
  message: 'Password is required for private rooms',
  path: ['password']
});

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek',
  'Turkish', 'Thai', 'Vietnamese'
];

const topics = [
  'Casual Talk', 'Language Learning', 'Business', 'Technology',
  'Culture', 'Travel', 'Food', 'Music', 'Movies', 'Sports',
  'News', 'Politics', 'Science', 'Education', 'Gaming',
  'Art', 'Literature', 'Philosophy', 'Health', 'Fashion'
];

const CreateRoomModal = ({ isOpen, onClose, onCreate }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      isPrivate: false,
      maxParticipants: 20
    }
  });

  const isPrivate = watch('isPrivate');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Process tags
      let tags = [];
      if (data.tags) {
        tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
      
      const roomData = {
        ...data,
        tags,
        maxParticipants: parseInt(data.maxParticipants)
      };

      // Remove password if not private
      if (!data.isPrivate) {
        delete roomData.password;
      }

      await onCreate(roomData);
      
      reset();
      toast.success('Room created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create a New Room"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Room Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Name *
          </label>
          <Input
            {...register('name')}
            placeholder="e.g., English Conversation Practice"
            error={errors.name?.message}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="What's this room about? (optional)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Language and Topic */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language *
            </label>
            <select
              {...register('language')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select language</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic *
            </label>
            <select
              {...register('topic')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select topic</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            {errors.topic && (
              <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
            )}
          </div>
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                {...register('isPrivate')}
                value={false}
                className="text-primary-600 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-1">
                <FaGlobe className="text-green-500" />
                <span>Public</span>
              </div>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                {...register('isPrivate')}
                value={true}
                className="text-primary-600 focus:ring-primary-500"
              />
              <div className="flex items-center space-x-1">
                <FaLock className="text-yellow-500" />
                <span>Private</span>
              </div>
            </label>
          </div>
        </div>

        {/* Password for private rooms */}
        {isPrivate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Password *
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder="Enter room password"
              error={errors.password?.message}
            />
          </div>
        )}

        {/* Max Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Participants (2-50)
          </label>
          <Input
            {...register('maxParticipants', { valueAsNumber: true })}
            type="number"
            min="2"
            max="50"
            error={errors.maxParticipants?.message}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <Input
            {...register('tags')}
            placeholder="e.g., beginner, casual, practice (comma-separated)"
            error={errors.tags?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            Add tags to help people find your room
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            Create Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoomModal;