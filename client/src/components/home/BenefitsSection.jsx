import React from 'react';
import { FaComments, FaHeadphones, FaBook, FaUserFriends } from 'react-icons/fa';
import Card from '../ui/Card';

const benefits = [
  {
    icon: FaComments,
    title: 'Real Conversations',
    description: 'No more textbooks - practice with real people in real situations'
  },
  {
    icon: FaHeadphones,
    title: 'Instant Feedback',
    description: 'Native speakers help correct your pronunciation in real-time'
  },
  {
    icon: FaBook,
    title: 'Structured Learning',
    description: 'Rooms categorized by level - from beginner to advanced'
  },
  {
    icon: FaUserFriends,
    title: 'Community Support',
    description: 'Join a friendly community that helps you stay motivated'
  }
];

const BenefitsSection = () => {
  return (
    <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {benefits.map((benefit, index) => {
        const Icon = benefit.icon;
        return (
          <Card key={index} className="p-6 text-center hover:bg-primary-50 transition group">
            <div className="inline-flex p-3 bg-primary-100 text-primary-600 rounded-xl mb-4 group-hover:scale-110 transition">
              <Icon size={24} />
            </div>
            <h3 className="font-semibold mb-2">{benefit.title}</h3>
            <p className="text-sm text-gray-600">{benefit.description}</p>
          </Card>
        );
      })}
    </section>
  );
};

export default BenefitsSection;