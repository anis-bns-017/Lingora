import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaComments, FaUsers, FaGlobe, FaRocket, FaShieldAlt, FaHeart } from 'react-icons/fa';
import { fetchRooms } from '../store/slices/roomSlice';
import RoomCard from '../components/rooms/RoomCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const Home = () => {
  const dispatch = useDispatch();
  const { rooms, isLoading } = useSelector((state) => state.rooms);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [featuredRooms, setFeaturedRooms] = useState([]);

  useEffect(() => {
    // Fetch active rooms for featured section
    dispatch(fetchRooms({ limit: 3, page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setFeaturedRooms(rooms.slice(0, 3));
    }
  }, [rooms]);

  const features = [
    {
      icon: <FaComments className="text-4xl text-primary-600" />,
      title: 'Live Voice Rooms',
      description: 'Join real-time voice conversations with language learners from around the world'
    },
    {
      icon: <FaUsers className="text-4xl text-primary-600" />,
      title: 'Native Speakers',
      description: 'Practice with native speakers who can help you improve your pronunciation'
    },
    {
      icon: <FaGlobe className="text-4xl text-primary-600" />,
      title: 'Multiple Languages',
      description: 'Learn English, Spanish, French, Japanese, Korean and many more languages'
    },
    {
      icon: <FaRocket className="text-4xl text-primary-600" />,
      title: 'Fast Progress',
      description: 'Accelerate your language learning through real conversations'
    },
    {
      icon: <FaShieldAlt className="text-4xl text-primary-600" />,
      title: 'Safe & Moderated',
      description: 'All rooms are moderated to ensure a friendly learning environment'
    },
    {
      icon: <FaHeart className="text-4xl text-primary-600" />,
      title: 'Community Driven',
      description: 'Join a supportive community of language enthusiasts'
    }
  ];

  const stats = [
    { label: 'Active Learners', value: '10K+' },
    { label: 'Languages', value: '15+' },
    { label: 'Daily Conversations', value: '5K+' },
    { label: 'Countries', value: '50+' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary-50 to-blue-50 rounded-3xl">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Learn Languages Through
          <span className="text-primary-600"> Real Conversations</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join voice rooms, practice with native speakers, and master your target language naturally.
          No textbooks, just real conversations.
        </p>
        <div className="flex justify-center space-x-4">
          {isAuthenticated ? (
            <Link to="/rooms">
              <Button size="lg" className="text-lg px-8">
                Browse Rooms
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/rooms">
                <Button variant="secondary" size="lg" className="text-lg px-8">
                  Explore as Guest
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose <span className="text-primary-600">Lingora</span>?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms Section */}
      {featuredRooms.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              Active <span className="text-primary-600">Rooms</span>
            </h2>
            <Link to="/rooms" className="text-primary-600 hover:text-primary-700 font-medium">
              View All Rooms →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* How It Works Section */}
      <section className="bg-white rounded-2xl p-12 shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It <span className="text-primary-600">Works</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Account</h3>
            <p className="text-gray-600">Sign up for free and set your learning goals</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Join a Room</h3>
            <p className="text-gray-600">Find a room that matches your language level</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Speaking</h3>
            <p className="text-gray-600">Practice with native speakers in real-time</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-primary-600 rounded-3xl text-white">
        <h2 className="text-4xl font-bold mb-4">Ready to Start Speaking?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of learners already improving their language skills
        </p>
        {!isAuthenticated && (
          <Link to="/login">
            <Button variant="secondary" size="lg" className="text-lg px-8 bg-white text-primary-600 hover:bg-gray-100">
              Create Free Account
            </Button>
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;