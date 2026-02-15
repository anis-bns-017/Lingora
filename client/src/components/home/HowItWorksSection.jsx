import React from 'react';
import { FaUsers, FaGlobe, FaMicrophone, FaCheckCircle } from 'react-icons/fa';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const steps = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Sign up for free, set your native language and the languages you want to learn',
    icon: FaUsers,
    details: [
      'Free account creation',
      'Set language preferences',
      'Choose your proficiency level',
      'Add profile picture and bio'
    ]
  },
  {
    step: 2,
    title: 'Find Your Room',
    description: 'Browse hundreds of active rooms based on language, topic, or skill level',
    icon: FaGlobe,
    details: [
      'Filter by language and topic',
      'See room participants count',
      'Join public or private rooms',
      'Create your own room'
    ]
  },
  {
    step: 3,
    title: 'Start Speaking',
    description: 'Jump into conversations, practice with natives, and get instant feedback',
    icon: FaMicrophone,
    details: [
      'Real-time voice chat',
      'Text chat with corrections',
      'Get language tips',
      'Make friends worldwide'
    ]
  }
];

const HowItWorksSection = () => {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12">
      <div className="text-center mb-12">
        <Badge variant="primary" className="mb-4 inline-block">Simple Process</Badge>
        <h2 className="text-4xl font-bold mb-4">
          Start Learning in <span className="text-primary-600">3 Easy Steps</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get started with Lingora in minutes and join thousands of successful language learners
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connector Line */}
        <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200"></div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="relative text-center group">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-primary-100 rounded-full blur-xl group-hover:opacity-100 transition"></div>
                <div className="relative w-20 h-20 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold transform group-hover:scale-110 transition">
                  <Icon size={32} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-600 mb-4">{step.description}</p>
              <ul className="text-left space-y-2">
                {step.details.map((detail, i) => (
                  <li key={i} className="text-sm text-gray-500 flex items-start">
                    <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorksSection;