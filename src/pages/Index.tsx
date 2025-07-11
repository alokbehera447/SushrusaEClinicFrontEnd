import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import AboutSection from '@/components/AboutSection';
import SpecialtiesShowcase from '@/components/SpecialtiesShowcase';
import HowItWorksSection from '@/components/HowItWorksSection';
import ImageContentBlocks from '@/components/ImageContentBlocks';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';
import { ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';

const Index = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Scroll to top button visibility
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // Intersection Observer for sections
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach((section) => observer.observe(section));

    // Smooth scroll for anchor links
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash) {
        e.preventDefault();
        const targetId = target.hash.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
          const offsetTop = element.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'specialties', label: 'Specialties' },
    { id: 'about', label: 'About' },
    { id: 'testimonials', label: 'Reviews' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full flex flex-col sticky top-0 z-40">
        <Navbar />
      </header>
      
      <main className="relative">
        {/* Hero Section */}
        <section id="hero" className="fade-in-section">
          <HeroSection />
        </section>
        
        {/* Image Content Blocks - Three Component Sections */}
        <section id="content-blocks" className="fade-in-section">
          <ImageContentBlocks />
        </section>
        
        {/* Services Section - Mobile Slider */}
        <section id="services" className="fade-in-section">
          <ServicesSection />
        </section>
        
        {/* Specialties Showcase - Mobile Slider */}
        <section id="specialties" className="fade-in-section">
          <SpecialtiesShowcase />
        </section>
        
        {/* About Section - Condensed */}
        <section id="about" className="fade-in-section">
          <AboutSection />
        </section>
        
        {/* Testimonials Section - Mobile Slider */}
        <section id="testimonials" className="fade-in-section">
          <TestimonialsSection />
        </section>
      </main>
      
      <Footer />
      
      {/* Scroll to Top Button */}
      <button
        className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 bg-gradient-orange hover:shadow-xl-colored text-white p-3 sm:p-4 rounded-full transition-all duration-300 hover-lift btn-modern min-h-[48px] min-w-[48px] sm:min-h-[56px] sm:min-w-[56px] ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};



export default Index;
