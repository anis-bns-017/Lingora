import React from 'react';
import { useSelector } from 'react-redux';

// Import all section components
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import RoomCreationSection from '../components/home/RoomCreationSection';
import LiveVoiceSection from '../components/home/LiveVoiceSection';
 import FeaturedRoomsSection from '../components/home/FeaturedRoomsSection';
import BenefitsSection from '../components/home/BenefitsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import FAQSection from '../components/home/FAQSection';
import CTASection from '../components/home/CTASection';
import Footer from '../components/layout/Footer';

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="space-y-20 pb-20">
      <HeroSection isAuthenticated={isAuthenticated} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RoomCreationSection isAuthenticated={isAuthenticated} />
      <LiveVoiceSection />
      <FeaturedRoomsSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection isAuthenticated={isAuthenticated} />
      <Footer />
    </div>
  );
};

export default Home;