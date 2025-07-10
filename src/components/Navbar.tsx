import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, Sparkles } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#home', label: 'Home' },
    { href: '#services', label: 'Services' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' }
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      {/* Animated Gradient Background - only when not scrolled */}
      {!isScrolled && (
        <div className="absolute inset-0 w-full h-full bg-gradient-hero overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
          <div className="absolute top-2 left-2 w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-transparent rounded-full blur-2xl animate-float"></div>
          <div className="absolute top-6 right-2 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-2xl animate-float animation-delay-300"></div>
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 z-10">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group hover-scale">
            <div className="relative">
              <div className="bg-gradient-orange p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover-glow">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1">
                <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-[#E17726] animate-pulse" />
              </div>
            </div>
            <div className="group-hover:scale-105 transition-transform duration-300">
              <span className="text-lg sm:text-xl lg:text-2xl font-black text-midnight group-hover:text-[#E17726] transition-colors duration-300">
                SUSHRUSA
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2 font-medium hidden sm:inline">eClinic</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className={`relative px-3 xl:px-6 py-2 text-midnight hover:text-[#E17726] transition-all duration-300 font-semibold tracking-wide group animate-slide-in-down animation-delay-${(index + 1) * 100}`}
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-orange group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
            ))}
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

        {/* Mobile Menu */}
        <div className={`lg:hidden mobile-menu-container overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen 
            ? 'max-h-screen opacity-100 pb-4' 
            : 'max-h-0 opacity-0 pb-0'
        }`}>
          <div className="glass rounded-xl p-4 mt-2 border border-white/20">
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className={`block px-3 py-2.5 text-midnight hover:text-[#E17726] hover:bg-[#E17726]/5 rounded-lg transition-all duration-300 font-semibold animate-fade-in-up animation-delay-${(index + 1) * 100} min-h-[40px] flex items-center text-sm`}
                >
                  {item.label}
                </a>
              ))}
              
              <div className="pt-3 border-t border-gray-200/50 space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full glass border-cyan-400/50 text-cyan-600 hover:bg-gradient-blue hover:text-white rounded-lg font-semibold transition-all duration-300 btn-modern min-h-[40px] text-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    size="sm"
                    className="w-full bg-gradient-orange text-white rounded-lg font-semibold transition-all duration-300 btn-modern min-h-[40px] text-sm"
                  >
                    <span className="flex items-center justify-center">
                      Register
                      <Sparkles className="w-3 h-3 ml-2" />
                    </span>
                  </Button>
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
