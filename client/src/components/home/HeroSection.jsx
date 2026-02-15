import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaPlayCircle, FaStar } from 'react-icons/fa';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import VideoModal from './VideoModal';

const HeroSection = ({ isAuthenticated }) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50 rounded-3xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <Badge variant="primary" size="lg" className="mb-6 inline-flex">
                <FaStar className="mr-2" /> #1 Language Learning Platform 2024
              </Badge>

              {/* Main Heading */}
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Learn Languages Through
                <span className="text-primary-600 block"> Real Conversations</span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 mb-8 max-w-2xl lg:mx-0">
                Join voice rooms, practice with native speakers, and master your target language naturally.
                No textbooks, just real conversations with real people.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                {isAuthenticated ? (
                  <Link to="/rooms">
                    <Button size="lg" className="text-lg px-8 group">
                      Browse Rooms
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button size="lg" className="text-lg px-8 group">
                        Get Started Free
                        <FaArrowRight className="ml-2 group-hover:translate-x-1 transition" />
                      </Button>
                    </Link>
                    <button
                      onClick={() => setShowVideo(true)}
                      className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-gray-700 hover:text-primary-600 transition"
                    >
                      <FaPlayCircle className="mr-2 text-primary-600" size={24} />
                      Watch Demo
                    </button>
                  </>
                )}
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center lg:justify-start space-x-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Avatar
                      key={i}
                      src={`https://i.pravatar.cc/150?img=${i}`}
                      size="sm"
                      className="border-2 border-white"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">10,000+</span> learners joined this week
                </p>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="flex-1 relative">
              <LiveRoomsPreview />
            </div>
          </div>
        </div>
      </section>

      <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />
    </>
  );
};

// Live Rooms Preview Component
const LiveRoomsPreview = () => (
  <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
    <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
      Live Now
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Avatar src={`https://i.pravatar.cc/150?img=${i+10}`} size="sm" />
          <div className="flex-1">
            <p className="font-medium">English Conversation {i}</p>
            <p className="text-xs text-gray-500">{12 + i} speakers</p>
          </div>
          <Badge variant="success">Live</Badge>
        </div>
      ))}
    </div>
  </div>
);

export default HeroSection;