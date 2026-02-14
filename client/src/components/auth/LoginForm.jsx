import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaEnvelope, FaLock, FaGoogle, FaGithub } from 'react-icons/fa';
import { login } from '../../store/slices/authSlice';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const LoginForm = ({ onToggleMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const from = location.state?.from?.pathname || '/rooms';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const result = await dispatch(login(data)).unwrap();
      toast.success(`Welcome back, ${result.username}!`);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}`;
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm onCancel={() => setShowForgotPassword(false)} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          className="flex justify-center items-center space-x-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <FaGoogle className="text-red-500" />
          <span className="text-sm font-medium text-gray-700">Google</span>
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin('github')}
          className="flex justify-center items-center space-x-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <FaGithub className="text-gray-900" />
          <span className="text-sm font-medium text-gray-700">GitHub</span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </button>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;