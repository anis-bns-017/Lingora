import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/rooms" replace />;
  }

  const renderContent = () => {
    switch (mode) {
      case 'register':
        return (
          <RegisterForm onToggleMode={() => setMode('login')} />
        );
      case 'forgot':
        return (
          <ForgotPasswordForm onCancel={() => setMode('login')} />
        );
      default:
        return (
          <LoginForm 
            onToggleMode={() => setMode('register')}
            onForgotPassword={() => setMode('forgot')}
          />
        );
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'register':
        return 'Create Your Account';
      case 'forgot':
        return 'Reset Password';
      default:
        return 'Welcome Back!';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'register':
        return 'Join thousands of language learners today';
      case 'forgot':
        return 'Enter your email to receive a reset link';
      default:
        return 'Sign in to continue your language journey';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-3xl font-bold text-white">{getTitle()}</h2>
            <p className="mt-2 text-blue-100">{getSubtitle()}</p>
          </div>

          <div className="px-8 py-6">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;