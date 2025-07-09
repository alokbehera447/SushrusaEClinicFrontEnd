import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import AboutSection from '@/components/AboutSection';
import SpecialtiesShowcase from '@/components/SpecialtiesShowcase';
import HowItWorksSection from '@/components/HowItWorksSection';
import ImageContentBlocks from '@/components/ImageContentBlocks';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Initialize scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    // Observe all sections with fade-in-section class
    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach((section) => observer.observe(section));

    // Smooth scroll behavior for anchor links
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash) {
        e.preventDefault();
        const targetId = target.hash.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
          const offsetTop = element.offsetTop - 80; // Account for navbar height
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // Optimized parallax effect for background elements
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const parallaxElements = document.querySelectorAll('.parallax');
          
          parallaxElements.forEach((element) => {
            const rate = scrolled * -0.3; // Reduced parallax intensity for better mobile performance
            (element as HTMLElement).style.transform = `translateY(${rate}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="relative">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Image Content Blocks */}
        <div id="content-blocks" className="fade-in-section">
          <ImageContentBlocks />
        </div>
        
        {/* Services Section */}
        <div id="services" className="fade-in-section">
          <ServicesSection />
        </div>
        
        {/* Specialties Showcase */}
        <div id="specialties" className="fade-in-section">
          <SpecialtiesShowcase />
        </div>
        
        {/* How It Works Section */}
        <div id="how-it-works" className="fade-in-section">
          <HowItWorksSection />
        </div>
        
        {/* About Section */}
        <div id="about" className="fade-in-section">
          <AboutSection />
        </div>
        
        {/* Testimonials Section */}
        <div id="testimonials" className="fade-in-section">
          <TestimonialsSection />
        </div>
      </main>
      
      <Footer />
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

// Scroll to Top Button Component
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 bg-gradient-orange hover:shadow-xl-colored text-white p-3 sm:p-4 rounded-full transition-all duration-300 hover-lift btn-modern min-h-[48px] min-w-[48px] sm:min-h-[56px] sm:min-w-[56px] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};

export default Index;
