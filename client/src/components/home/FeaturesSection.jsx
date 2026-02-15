import React from 'react';
import { FaComments, FaUsers, FaGlobe, FaRocket, FaShieldAlt, FaHeart } from 'react-icons/fa';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const features = [
  {
    icon: <FaComments className="text-4xl text-primary-600" />,
    title: 'Live Voice Rooms',
    description: 'Join real-time voice conversations with language learners from around the world',
    stats: '500+ Active Rooms Daily'
  },
  {
    icon: <FaUsers className="text-4xl text-primary-600" />,
    title: 'Native Speakers',
    description: 'Practice with native speakers who can help you improve your pronunciation',
    stats: '10K+ Native Speakers'
  },
  {
    icon: <FaGlobe className="text-4xl text-primary-600" />,
    title: 'Multiple Languages',
    description: 'Learn English, Spanish, French, Japanese, Korean and many more languages',
    stats: '25+ Languages Supported'
  },
  {
    icon: <FaRocket className="text-4xl text-primary-600" />,
    title: 'Fast Progress',
    description: 'Accelerate your language learning through real conversations',
    stats: '2x Faster Learning'
  },
  {
    icon: <FaShieldAlt className="text-4xl text-primary-600" />,
    title: 'Safe & Moderated',
    description: 'All rooms are moderated to ensure a friendly learning environment',
    stats: '24/7 Moderation'
  },
  {
    icon: <FaHeart className="text-4xl text-primary-600" />,
    title: 'Community Driven',
    description: 'Join a supportive community of language enthusiasts',
    stats: '50K+ Community Members'
  }
];

const FeaturesSection = () => {
  return (
    <section>
      <div className="text-center mb-12">
        <Badge variant="primary" className="mb-4 inline-block">Why Choose Us</Badge>
        <h2 className="text-4xl font-bold mb-4">
          Everything You Need to
          <span className="text-primary-600"> Master a Language</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our platform combines the best of technology and human interaction to create the perfect language learning environment.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="p-8 hover:shadow-xl transition group">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary-100 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative bg-primary-50 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                {feature.icon}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-gray-600 mb-4">{feature.description}</p>
            <Badge variant="secondary">{feature.stats}</Badge>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;