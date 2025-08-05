import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, Sparkles } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      // Hide/show navbar on mobile based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and not at top
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // const navItems = [
  //   { href: '#home', label: 'Home' },
  //   { href: '#services', label: 'Services' },
  //   { href: '#about', label: 'About' },
  //   { href: '#contact', label: 'Contact' }
  // ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  const handleMobileNavigation = (href: string) => {
    // Close menu immediately
    setIsMenuOpen(false);
    
    // Small delay to ensure menu closes before scrolling
    setTimeout(() => {
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'lg:bg-white/80 lg:backdrop-blur-md lg:shadow' : ''} ${!isVisible ? '-translate-y-full' : 'translate-y-0'}`}>
      {/* Always show Animated Gradient Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0 bg-gradient-mesh opacity-40"></div>
        <div className="absolute -top-4 left-2 w-32 h-32 bg-gradient-to-br from-[#E17726]/30 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="absolute -top-2 right-2 w-40 h-40 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-full blur-2xl animate-float animation-delay-300"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 z-10">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group hover-scale">
            <img 
              src="/sushrusa_logo_1-Photoroom.png" 
              alt="Sushrusa Logo" 
              className="h-16 w-16 sm:h-18 sm:w-18 lg:h-20 lg:w-20 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div className="group-hover:scale-105 transition-transform duration-300">
              <span className="text-lg sm:text-xl lg:text-2xl font-black text-midnight group-hover:text-[#E17726] transition-colors duration-300">
                SUSHRUSA
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2 font-medium hidden sm:inline">eClinic</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {/* navItems.map((item, index) => ( */}
              <a
                key="home"
                href="#home"
                onClick={(e) => handleSmoothScroll(e, "#home")}
                className={`relative px-3 xl:px-6 py-2 text-midnight hover:text-[#E17726] transition-all duration-300 font-semibold tracking-wide group animate-slide-in-down animation-delay-100`}
              >
                Home
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-orange group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
              <a
                key="services"
                href="#services"
                onClick={(e) => handleSmoothScroll(e, "#services")}
                className={`relative px-3 xl:px-6 py-2 text-midnight hover:text-[#E17726] transition-all duration-300 font-semibold tracking-wide group animate-slide-in-down animation-delay-200`}
              >
                Services
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-orange group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
              <a
                key="about"
                href="#about"
                onClick={(e) => handleSmoothScroll(e, "#about")}
                className={`relative px-3 xl:px-6 py-2 text-midnight hover:text-[#E17726] transition-all duration-300 font-semibold tracking-wide group animate-slide-in-down animation-delay-300`}
              >
                About
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-orange group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
              <a
                key="contact"
                href="#contact"
                onClick={(e) => handleSmoothScroll(e, "#contact")}
                className={`relative px-3 xl:px-6 py-2 text-midnight hover:text-[#E17726] transition-all duration-300 font-semibold tracking-wide group animate-slide-in-down animation-delay-400`}
              >
                Contact
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-orange group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
            {/* ))} */}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 animate-slide-in-down animation-delay-500">
            <Link to="/login" className="group">
              <Button 
                variant="outline" 
                size="sm"
                className="glass border-2 border-cyan-400/50 text-cyan-600 hover:bg-gradient-blue hover:text-white hover:border-cyan-400 rounded-full px-3 xl:px-6 py-1.5 xl:py-2 font-semibold transition-all duration-300 hover-lift btn-modern text-sm"
              >
                Login
              </Button>
            </Link>
            <Link to="/register" className="group">
              <Button 
                size="sm"
                className="bg-gradient-orange text-white rounded-full px-3 xl:px-6 py-1.5 xl:py-2 font-semibold transition-all duration-300 hover-lift btn-modern group-hover:scale-105 text-sm"
              >
                <span className="flex items-center">
                  Register
                  <Sparkles className="w-3 h-3 xl:w-4 xl:h-4 ml-1.5 xl:ml-2 group-hover:rotate-180 transition-transform duration-500" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden mobile-menu-container">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="relative text-midnight hover:text-[#E17726] transition-colors duration-300 p-1.5 rounded-lg hover:bg-[#E17726]/10 group min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <Menu 
                  className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                  }`} 
                />
                <X 
                  className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ease-in-out bg-white ${
          isMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}>
          {/* Mobile Menu Content */}
          <div className="relative z-50 h-full flex flex-col mobile-menu-container">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-orange p-2.5 rounded-xl shadow-lg">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-3 w-3 text-[#E17726] animate-pulse" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-black text-midnight">SUSHRUSA</span>
                  <div className="text-xs text-gray-600 font-medium">eClinic</div>
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="text-midnight hover:text-[#E17726] transition-all duration-300 p-3 rounded-xl hover:bg-gray-100 hover:scale-110 group shadow-sm"
                aria-label="Close menu"
              >
                <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            
            {/* Navigation Items */}
            <div className="flex-1 px-6 py-6 bg-white">
              <div className="space-y-3">
                {/* navItems.map((item, index) => ( */}
                  <button
                    key="home"
                    onClick={() => handleMobileNavigation("#home")}
                    className={`group block w-full text-left px-5 py-4 text-midnight hover:text-[#E17726] hover:bg-gray-50 rounded-xl transition-all duration-300 font-semibold animate-fade-in-up animation-delay-150 min-h-[48px] flex items-center text-base relative overflow-hidden border border-gray-200 hover:border-[#E17726]/40 shadow-sm hover:shadow-md`}
                  >
                    {/* Icon indicator */}
                    <div className="w-2.5 h-2.5 bg-gradient-orange rounded-full mr-3 group-hover:scale-150 transition-transform duration-300 shadow-sm"></div>
                    
                    <span className="relative z-10">Home</span>
                    
                    {/* Arrow indicator */}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      <svg className="w-4 h-4 text-[#E17726]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    key="services"
                    onClick={() => handleMobileNavigation("#services")}
                    className={`group block w-full text-left px-5 py-4 text-midnight hover:text-[#E17726] hover:bg-gray-50 rounded-xl transition-all duration-300 font-semibold animate-fade-in-up animation-delay-200 min-h-[48px] flex items-center text-base relative overflow-hidden border border-gray-200 hover:border-[#E17726]/40 shadow-sm hover:shadow-md`}
                  >
                    {/* Icon indicator */}
                    <div className="w-2.5 h-2.5 bg-gradient-orange rounded-full mr-3 group-hover:scale-150 transition-transform duration-300 shadow-sm"></div>
                    
                    <span className="relative z-10">Services</span>
                    
                    {/* Arrow indicator */}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      <svg className="w-4 h-4 text-[#E17726]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    key="about"
                    onClick={() => handleMobileNavigation("#about")}
                    className={`group block w-full text-left px-5 py-4 text-midnight hover:text-[#E17726] hover:bg-gray-50 rounded-xl transition-all duration-300 font-semibold animate-fade-in-up animation-delay-300 min-h-[48px] flex items-center text-base relative overflow-hidden border border-gray-200 hover:border-[#E17726]/40 shadow-sm hover:shadow-md`}
                  >
                    {/* Icon indicator */}
                    <div className="w-2.5 h-2.5 bg-gradient-orange rounded-full mr-3 group-hover:scale-150 transition-transform duration-300 shadow-sm"></div>
                    
                    <span className="relative z-10">About</span>
                    
                    {/* Arrow indicator */}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      <svg className="w-4 h-4 text-[#E17726]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    key="contact"
                    onClick={() => handleMobileNavigation("#contact")}
                    className={`group block w-full text-left px-5 py-4 text-midnight hover:text-[#E17726] hover:bg-gray-50 rounded-xl transition-all duration-300 font-semibold animate-fade-in-up animation-delay-400 min-h-[48px] flex items-center text-base relative overflow-hidden border border-gray-200 hover:border-[#E17726]/40 shadow-sm hover:shadow-md`}
                  >
                    {/* Icon indicator */}
                    <div className="w-2.5 h-2.5 bg-gradient-orange rounded-full mr-3 group-hover:scale-150 transition-transform duration-300 shadow-sm"></div>
                    
                    <span className="relative z-10">Contact</span>
                    
                    {/* Arrow indicator */}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      <svg className="w-4 h-4 text-[#E17726]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                {/* ))} */}
              </div>
              
              {/* Decorative element */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 rounded-full border border-[#E17726]/20">
                  <div className="w-1.5 h-1.5 bg-[#E17726] rounded-full animate-pulse"></div>
                  <span className="text-xs text-midnight font-medium">Premium Healthcare</span>
                </div>
              </div>
            </div>
            
            {/* Bottom CTA Buttons */}
            <div className="p-6 border-t border-gray-200 space-y-4 bg-white shadow-sm">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full bg-white border-gray-300 text-midnight hover:bg-gray-50 hover:text-midnight rounded-xl font-semibold transition-all duration-300 btn-modern min-h-[48px] text-sm group hover:scale-[1.02] shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Login
                  </span>
                </Button>
              </Link>
              <div className="text-center">
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-[#E17726] hover:text-[#FF8A56] font-semibold text-sm transition-colors duration-300">
                  Don't have an account? Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
