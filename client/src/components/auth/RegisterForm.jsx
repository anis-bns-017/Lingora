import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaUser, FaEnvelope, FaLock, FaGlobe } from 'react-icons/fa';
import { register as registerUser } from '../../store/slices/authSlice';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  confirmPassword: z.string(),
  nativeLanguage: z.string().min(1, 'Please select your native language')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Hindi',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek',
  'Turkish', 'Thai', 'Vietnamese', 'Indonesian', 'Other'
];

const RegisterForm = ({ onToggleMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...registerData } = data;
      const result = await dispatch(registerUser(registerData)).unwrap();
      toast.success('Account created successfully!');
      navigate('/rooms');
    } catch (error) {
      toast.error(error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <Input
          id="username"
          type="text"
          placeholder="johndoe123"
          icon={<FaUser className="text-gray-400" />}
          {...register('username')}
          error={errors.username?.message}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          icon={<FaEnvelope className="text-gray-400" />}
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      <div>
        <label htmlFor="nativeLanguage" className="block text-sm font-medium text-gray-700 mb-1">
          Native Language
        </label>
        <select
          id="nativeLanguage"
          {...register('nativeLanguage')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select your native language</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        {errors.nativeLanguage && (
          <p className="mt-1 text-sm text-red-600">{errors.nativeLanguage.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          icon={<FaLock className="text-gray-400" />}
          {...register('password')}
          error={errors.password?.message}
        />
        <p className="mt-1 text-xs text-gray-500">
          Must be at least 6 characters with at least one letter and one number
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          icon={<FaLock className="text-gray-400" />}
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Sign in
        </button>
      </p>

      <p className="text-xs text-gray-500 text-center mt-4">
        By signing up, you agree to our{' '}
        <a href="/terms" className="text-primary-600 hover:text-primary-500">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-primary-600 hover:text-primary-500">
          Privacy Policy
        </a>
      </p>
    </form>
  );
};

export default RegisterForm;