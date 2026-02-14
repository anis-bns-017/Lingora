import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaEnvelope, FaLock, FaGoogle, FaGithub, FaUserPlus } from 'react-icons/fa';
import { login, register as registerUser } from '../store/slices/authSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  confirmPassword: z.string()
    .min(6, 'Password must be at least 6 characters'),
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

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      if (isLogin) {
        // Login
        const result = await dispatch(login({
          email: data.email,
          password: data.password
        })).unwrap();
        
        toast.success(`Welcome back, ${result.username}!`);
        navigate('/rooms');
      } else {
        // Register
        const { confirmPassword, ...registerData } = data;
        const result = await dispatch(registerUser(registerData)).unwrap();
        
        toast.success('Account created successfully!');
        navigate('/rooms');
      }
    } catch (error) {
      toast.error(error || 'Authentication failed');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    // Implement forgot password logic
    toast.success('Password reset link sent to your email');
    setShowForgotPassword(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FaGoogle className="text-red-500" />
            <span>Google</span>
          </button>
          <button className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FaGithub className="text-gray-900" />
            <span>GitHub</span>
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Forgot Password Form */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="mt-8 space-y-6">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                icon={<FaEnvelope className="text-gray-400" />}
              />
            </div>
            <div className="flex space-x-3">
              <Button type="submit" className="flex-1">
                Send Reset Link
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForgotPassword(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          /* Login/Register Form */
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe123"
                      {...register('username')}
                      error={errors.username?.message}
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
                </>
              )}

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

              {!isLogin && (
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
              )}
            </div>

            {isLogin && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full flex justify-center items-center space-x-2"
              >
                {isLogin ? (
                  <>
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    <span>Create Account</span>
                  </>
                )}
              </Button>
            </div>

            {!isLogin && (
              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;