import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FaComments, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaGlobe, 
  FaChevronDown, 
  FaCompass,
  FaMicrophone,
  FaChartLine
} from 'react-icons/fa';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully', {
      icon: '👋',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/rooms', label: 'Explore Rooms', icon: FaCompass },
    { path: '/voice-practice', label: 'Voice Practice', icon: FaMicrophone },
    { path: '/analytics', label: 'Analytics', icon: FaChartLine },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 py-2' 
        : 'bg-white/80 backdrop-blur-md py-3'
    }`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center">
          
          {/* Logo Section with hover effect */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group relative"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2 rounded-xl shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 group-hover:scale-110 transition-all duration-300">
              <FaGlobe className="text-xl text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
              Lingora<span className="text-indigo-600">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Dynamic Navigation Links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2.5 text-sm font-semibold transition-all duration-300 group ${
                    isActive(link.path) 
                      ? 'text-indigo-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`text-base transition-transform duration-300 ${
                      isActive(link.path) ? 'rotate-12' : 'group-hover:rotate-12'
                    }`} />
                    {link.label}
                  </span>
                  {isActive(link.path) && (
                    <span className="absolute inset-0 bg-indigo-50 rounded-2xl -z-0 animate-in fade-in" />
                  )}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-2xl border-2 transition-all duration-300 ${
                    isUserMenuOpen 
                      ? 'border-indigo-300 bg-indigo-50 shadow-md' 
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=6366f1&color=fff&bold=true`}
                      alt={user?.username}
                      className="w-8 h-8 rounded-xl object-cover shadow-md ring-2 ring-white"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate">
                    {user?.username}
                  </span>
                  <FaChevronDown className={`text-xs text-gray-500 transition-transform duration-300 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Enhanced Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-bold text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    {/* Profile Link */}
                    <Link
                      to={`/profile/${user?._id}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-white group transition-all"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <FaUser className="text-indigo-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-semibold">My Profile</p>
                        <p className="text-xs text-gray-500">View your profile</p>
                      </div>
                    </Link>

                    {/* Voice Practice Stats (Quick View) */}
                    <div className="px-4 py-3 mx-2 my-1 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                      <p className="text-xs font-medium text-purple-600 mb-2">Today's Practice</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-gray-900">3</p>
                          <p className="text-xs text-gray-500">Recordings</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">78%</p>
                          <p className="text-xs text-gray-500">Avg. Score</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">12m</p>
                          <p className="text-xs text-gray-500">Time</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-white group transition-all"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <FaSignOutAlt className="text-red-600 text-sm" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Log out</p>
                        <p className="text-xs text-gray-500">Sign out from your account</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all hover:bg-gray-100 rounded-2xl"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-gray-200 hover:shadow-indigo-200 hover:scale-105 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle with improved styling */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <div className="relative w-5 h-5">
              <span className={`absolute w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${
                isMobileOpen ? 'rotate-45 top-2.5' : 'rotate-0 top-1'
              }`} />
              <span className={`absolute w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 top-2.5 ${
                isMobileOpen ? 'opacity-0' : 'opacity-100'
              }`} />
              <span className={`absolute w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${
                isMobileOpen ? '-rotate-45 top-2.5' : 'rotate-0 top-4'
              }`} />
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-2">
            {/* Dynamic Mobile Navigation Links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-4 text-base font-bold rounded-2xl transition-all group ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isActive(link.path)
                      ? 'bg-indigo-200'
                      : 'bg-indigo-100 group-hover:bg-indigo-200'
                  }`}>
                    <Icon className={`text-lg ${
                      isActive(link.path) ? 'text-indigo-600' : 'text-indigo-600'
                    }`} />
                  </div>
                  <span>{link.label}</span>
                  {isActive(link.path) && (
                    <Badge variant="primary" size="sm" className="ml-auto">Active</Badge>
                  )}
                </Link>
              );
            })}
            
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />
            
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="font-bold text-gray-900">{user?.username}</p>
                </div>
                
                {/* Voice Practice Quick Stats for Mobile */}
                <div className="mx-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl mb-2">
                  <p className="text-sm font-medium text-purple-600 mb-3">Today's Progress</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">3</p>
                      <p className="text-xs text-gray-500">Rec</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">78%</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">12m</p>
                      <p className="text-xs text-gray-500">Time</p>
                    </div>
                  </div>
                </div>
                
                <Link
                  to={`/profile/${user?._id}`}
                  className="flex items-center gap-3 px-4 py-4 text-gray-700 font-bold hover:bg-indigo-50 rounded-2xl transition-all group"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <FaUser className="text-indigo-600" />
                  </div>
                  <div>
                    <p>My Profile</p>
                    <p className="text-xs font-normal text-gray-500">View and edit your profile</p>
                  </div>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all group"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <FaSignOutAlt className="text-red-600" />
                  </div>
                  <div className="text-left">
                    <p>Log out</p>
                    <p className="text-xs font-normal text-gray-500">Sign out from your account</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-3 px-4">
                <Link
                  to="/login"
                  className="block w-full py-4 text-center font-bold text-gray-700 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-center rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-95 transition-all"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Tab Button Component for the navbar (if needed)
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-300 border-b-2 ${
      active
        ? 'border-indigo-600 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    <Icon className={active ? 'text-indigo-600' : 'text-gray-400'} size={18} />
    {label}
  </button>
);

export default Navbar;