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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'glass shadow-xl backdrop-blur-xl border-b border-white/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group hover-scale">
            <div className="relative">
              <div className="bg-gradient-orange p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-modern group-hover:shadow-xl-colored transition-all duration-300 hover-glow">
                <Heart className="h-5 w-5 sm:h-7 sm:w-7 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-[#E17726] animate-pulse" />
              </div>
            </div>
            <div className="group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl sm:text-2xl font-black text-midnight group-hover:text-[#E17726] transition-colors duration-300">
                SUSHRUSA
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2 font-medium hidden sm:inline">eClinic</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className={`relative px-4 lg:px-6 py-3 text-midnight hover:text-[#E17726] transition-all duration-300 font-semibold tracking-wide group animate-slide-in-down animation-delay-${(index + 1) * 100}`}
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-orange group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 animate-slide-in-down animation-delay-500">
            <Link to="/login" className="group">
              <Button 
                variant="outline" 
                className="glass border-2 border-cyan-400/50 text-cyan-600 hover:bg-gradient-blue hover:text-white hover:border-cyan-400 rounded-full px-4 lg:px-6 py-2 font-semibold transition-all duration-300 hover-lift btn-modern"
              >
                Login
              </Button>
            </Link>
            <Link to="/login" className="group">
              <Button className="bg-gradient-orange hover:shadow-xl-colored text-white rounded-full px-4 lg:px-6 py-2 font-semibold transition-all duration-300 hover-lift btn-modern group-hover:scale-105">
                <span className="flex items-center">
                  Register
                  <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 ml-2 group-hover:rotate-180 transition-transform duration-500" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden mobile-menu-container">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="relative text-midnight hover:text-[#E17726] transition-colors duration-300 p-2 rounded-xl hover:bg-[#E17726]/10 group min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                  }`} 
                />
                <X 
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden mobile-menu-container overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen 
            ? 'max-h-screen opacity-100 pb-6' 
            : 'max-h-0 opacity-0 pb-0'
        }`}>
          <div className="glass rounded-2xl p-6 mt-4 border border-white/20">
            <div className="space-y-4">
              {navItems.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className={`block px-4 py-3 text-midnight hover:text-[#E17726] hover:bg-[#E17726]/5 rounded-xl transition-all duration-300 font-semibold animate-fade-in-up animation-delay-${(index + 1) * 100} min-h-[44px] flex items-center`}
                >
                  {item.label}
                </a>
              ))}
              
              <div className="pt-4 border-t border-gray-200/50 space-y-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full glass border-cyan-400/50 text-cyan-600 hover:bg-gradient-blue hover:text-white rounded-xl font-semibold transition-all duration-300 btn-modern min-h-[44px]"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-orange hover:shadow-xl-colored text-white rounded-xl font-semibold transition-all duration-300 btn-modern min-h-[44px]">
                    <span className="flex items-center justify-center">
                      Register
                      <Sparkles className="w-4 h-4 ml-2" />
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
