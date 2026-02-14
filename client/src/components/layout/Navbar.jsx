import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaSignOutAlt, FaComments } from 'react-icons/fa';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaComments className="text-3xl text-primary-600" />
            <span className="text-xl font-bold text-gray-800">Lingora</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/rooms" className="text-gray-600 hover:text-primary-600 transition">
              Rooms
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to={`/profile/${user?._id}`} className="text-gray-600 hover:text-primary-600 transition">
                  Profile
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <img
                      src={user?.avatar || '/default-avatar.png'}
                      alt={user?.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-gray-600">{user?.username}</span>
                  </button>
                  
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link
                        to={`/profile/${user?._id}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaUser className="inline mr-2" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <FaSignOutAlt className="inline mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;