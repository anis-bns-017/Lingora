import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaLock } from 'react-icons/fa';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import api from '../../services/api';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await api.post('/auth/reset-password', {
        token,
        password: data.password
      });
      toast.success('Password reset successfully! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Invalid or missing reset token</p>
        <Button onClick={() => navigate('/login')} className="mt-4">
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
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
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;