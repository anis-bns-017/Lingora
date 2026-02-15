import React from 'react';
import { FaUsers, FaLanguage, FaComments, FaGlobe, FaStar, FaClock } from 'react-icons/fa';
import Card from '../ui/Card';

const stats = [
  { label: 'Active Learners', value: '50K+', icon: FaUsers, color: 'blue' },
  { label: 'Languages', value: '25+', icon: FaLanguage, color: 'green' },
  { label: 'Daily Conversations', value: '10K+', icon: FaComments, color: 'purple' },
  { label: 'Countries', value: '120+', icon: FaGlobe, color: 'yellow' },
  { label: 'Native Speakers', value: '15K+', icon: FaStar, color: 'orange' },
  { label: 'Learning Hours', value: '1M+', icon: FaClock, color: 'red' }
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600'
};

const StatsSection = () => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="text-center p-6 hover:shadow-lg transition group">
            <div className={`inline-flex p-3 rounded-xl ${colorClasses[stat.color]} mb-3 group-hover:scale-110 transition`}>
              <Icon size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        );
      })}
    </section>
  );
};

export default StatsSection;