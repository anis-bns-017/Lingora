import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Profile from './pages/Profile';

// Components
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import AuthGuard from './components/auth/AuthGuard';

// Store actions
import { getCurrentUser } from './store/slices/authSlice';
import authService from './services/authService';
import VoicePractice from './pages/VoicePractice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      try {
        const result = await authService.checkAuth();
        if (result.isAuthenticated) {
          dispatch(getCurrentUser());
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    
    checkAuth();
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                <AuthGuard requireAuth={false}>
                  <Login />
                </AuthGuard>
              } 
            />
            <Route 
              path="/login" 
              element={
                <AuthGuard requireAuth={false}>
                  <Login />
                </AuthGuard>
              } 
            />
            <Route path="/voice-practice" element={<VoicePractice />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route 
              path="/room/:id" 
              element={
                <PrivateRoute>
                  <RoomDetail />
                </PrivateRoute>
              } 
            />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;