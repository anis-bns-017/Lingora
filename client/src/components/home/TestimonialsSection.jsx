import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const testimonials = [
  {
    name: 'Maria Garcia',
    role: 'Spanish Learner',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: 'Lingora transformed my Spanish learning journey. I went from struggling with basic conversations to confidently speaking with natives in just 3 months!',
    rating: 5,
    achievement: 'Advanced Fluency'
  },
  {
    name: 'John Smith',
    role: 'English Teacher',
    avatar: 'https://i.pravatar.cc/150?img=2',
    content: 'As an English teacher, I recommend Lingora to all my students. It provides the real-world practice that textbooks simply cannot offer.',
    rating: 5,
    achievement: '500+ Hours Taught'
  },
  {
    name: 'Yuki Tanaka',
    role: 'Japanese Learner',
    avatar: 'https://i.pravatar.cc/150?img=3',
    content: 'The Japanese rooms are amazing! I\'ve made so many friends and my speaking skills have improved dramatically.',
    rating: 5,
    achievement: '3 Months to Conversational'
  }
];

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-primary-600 rounded-3xl p-12 text-white">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4 inline-block bg-white text-primary-600">Success Stories</Badge>
        <h2 className="text-4xl font-bold mb-4">What Our Learners Say</h2>
        <p className="text-xl text-primary-100 max-w-2xl mx-auto">
          Join thousands of successful language learners who achieved fluency through Lingora
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <FaQuoteLeft className="absolute top-0 left-0 text-primary-300 opacity-30" size={60} />
        
        <div className="relative bg-white text-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center mb-6">
            <Avatar src={testimonials[currentTestimonial].avatar} size="lg" className="mr-4" />
            <div>
              <h4 className="font-bold text-lg">{testimonials[currentTestimonial].name}</h4>
              <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < testimonials[currentTestimonial].rating ? 'text-yellow-400' : 'text-gray-300'} size={16} />
                ))}
              </div>
            </div>
            <Badge variant="primary" className="ml-auto hidden sm:block">
              {testimonials[currentTestimonial].achievement}
            </Badge>
          </div>
          <p className="text-lg italic">"{testimonials[currentTestimonial].content}"</p>
        </div>

        {/* Testimonial Navigation */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentTestimonial ? 'bg-white' : 'bg-primary-300 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;