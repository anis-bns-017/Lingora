import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Rooms from './pages/Rooms';
import Profile from './pages/Profile';
import VoicePractice from './pages/VoicePractice';

// Components
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import AuthGuard from './components/auth/AuthGuard';

// Store actions
import { getCurrentUser } from './store/slices/authSlice';
import authService from './services/authService';
import Spinner from './components/ui/Spinner';
import RoomDetail from './components/room/RoomDetail/RoomDetail';

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await authService.checkAuth();
        if (result.isAuthenticated) {
          await dispatch(getCurrentUser()).unwrap();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [dispatch]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                <AuthGuard requireAuth={false}>
                  <Login />
                </AuthGuard>
              } 
            />
            <Route path="/rooms" element={<Rooms />} />

            {/* Protected Routes */}
            <Route 
              path="/voice-practice" 
              element={
                <PrivateRoute>
                  <VoicePractice />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/room/:id" 
              element={
                <PrivateRoute>
                  <RoomDetail />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/profile/:id" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />

            {/* Catch all - 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              icon: '🎉',
            },
            error: {
              duration: 4000,
              icon: '❌',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;