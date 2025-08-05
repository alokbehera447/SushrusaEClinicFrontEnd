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
import StatsTrustIndicators from '@/components/StatsTrustIndicators';

import SecurityPrivacy from '@/components/SecurityPrivacy';
import CoverageLocations from '@/components/CoverageLocations';
import BlogResources from '@/components/BlogResources';
import PartnershipsCertifications from '@/components/PartnershipsCertifications';
import ContactSupport from '@/components/ContactSupport';

const Index = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Scroll to top button visibility
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // Only use intersection observer on desktop
    if (!isMobile) {
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

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', toggleVisibility);
        window.removeEventListener('resize', checkMobile);
      };
    } else {
      // On mobile, make all sections visible immediately
      const sections = document.querySelectorAll('.fade-in-section');
      sections.forEach((section) => {
        section.classList.add('is-visible');
        section.style.opacity = '1';
        section.style.transform = 'none';
      });
    }

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
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

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
        <section id="hero" className={`fade-in-section ${isMobile ? 'is-visible' : ''}`}>
          <HeroSection />
        </section>

        {/* Optimal UI/UX Order */}
        
        {/* Trust Building First */}
        <StatsTrustIndicators />
        
        {/* Core Value Proposition */}
        <section id="content-blocks" className={`fade-in-section ${isMobile ? 'is-visible' : ''}`}>
          <ImageContentBlocks />
        </section>
        
        {/* Services Overview */}
        <section id="services" className={`fade-in-section ${isMobile ? 'is-visible' : ''}`}>
          <ServicesSection />
        </section>
        

        
        {/* Specialties */}
        <section id="specialties" className={`fade-in-section ${isMobile ? 'is-visible' : ''}`}>
          <SpecialtiesShowcase />
        </section>
        
        {/* Security & Trust */}
        <SecurityPrivacy />
        
        {/* Coverage & Availability */}
        <CoverageLocations />
        
        {/* Social Proof */}
        <section id="testimonials" className={`fade-in-section ${isMobile ? 'is-visible' : ''}`}>
          <TestimonialsSection />
        </section>
        
        {/* About Us */}
        <section id="about" className={`fade-in-section ${isMobile ? 'is-visible' : ''}`}>
          <AboutSection />
        </section>
        
        {/* Additional Resources */}
        <BlogResources />
        <PartnershipsCertifications />
        
        {/* Final CTA */}
        <ContactSupport />
      </main>
      
      <Footer />
      
      {/* Scroll to Top Button */}
      <button
        className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 bg-orange-600 hover:bg-orange-700 text-white p-3 sm:p-4 rounded-full transition-all duration-300 min-h-[48px] min-w-[48px] sm:min-h-[56px] sm:min-w-[56px] ${
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
