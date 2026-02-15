import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaHeart } from 'react-icons/fa';
import Button from '../ui/Button';

const CTASection = ({ isAuthenticated }) => {
  if (isAuthenticated) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative container mx-auto px-8 py-16 text-center">
        <FaHeart className="inline-block text-6xl text-white opacity-25 mb-6" />
        <h2 className="text-4xl font-bold mb-4">Ready to Start Your Language Journey?</h2>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Join thousands of learners already improving their language skills through real conversations
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <Link to="/login">
            <Button variant="secondary" size="lg" className="text-lg px-8 bg-white text-primary-600 hover:bg-gray-100 group">
              Create Free Account
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition" />
            </Button>
          </Link>
          <Link to="/rooms">
            <Button variant="outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary-600">
              Browse as Guest
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <TrustBadges />
      </div>
    </section>
  );
};

const TrustBadges = () => {
  const badges = [
    { value: '50K+', label: 'Active Users' },
    { value: '25+', label: 'Languages' },
    { value: '1M+', label: 'Hours Spoken' },
    { value: '4.9★', label: 'User Rating' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
      {badges.map((badge, index) => (
        <div key={index} className="text-center">
          <div className="text-2xl font-bold">{badge.value}</div>
          <div className="text-sm opacity-75">{badge.label}</div>
        </div>
      ))}
    </div>
  );
};

export default CTASection;