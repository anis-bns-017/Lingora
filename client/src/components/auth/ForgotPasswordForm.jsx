import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import api from '../../services/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email')
});

const ForgotPasswordForm = ({ onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', data);
      setEmailSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <FaEnvelope className="text-green-600 text-2xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
        <p className="text-sm text-gray-500">
          We've sent a password reset link to your email address. Please check your inbox.
        </p>
        <Button onClick={onCancel} variant="secondary" className="mt-4">
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Reset your password</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <Input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            icon={<FaEnvelope className="text-gray-400" />}
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            <FaArrowLeft className="inline mr-2" />
            Back
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
          >
            Send Reset Link
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;