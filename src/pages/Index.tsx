
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ImageContentBlocks from '@/components/ImageContentBlocks';
import SpecialtiesShowcase from '@/components/SpecialtiesShowcase';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ImageContentBlocks />
      <SpecialtiesShowcase />
      <AboutSection />
      <ServicesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Index;
