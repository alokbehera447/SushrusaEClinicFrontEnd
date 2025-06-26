
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-soft sticky top-0 z-50 border-b border-sand-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-earth-green p-2 rounded-xl shadow-md">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-midnight">SUSHRUSA</span>
              <span className="text-sm text-gray-500 ml-1">eClinic</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-midnight hover:text-earth-green transition-colors font-medium">Home</a>
            <a href="#services" className="text-midnight hover:text-earth-green transition-colors font-medium">Services</a>
            <a href="#about" className="text-midnight hover:text-earth-green transition-colors font-medium">About</a>
            <a href="#contact" className="text-midnight hover:text-earth-green transition-colors font-medium">Contact</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-aqua text-aqua hover:bg-aqua hover:text-white rounded-full px-6">
              Login
            </Button>
            <Button className="bg-orange-deep hover:bg-orange-deep-dark text-white rounded-full px-6">
              Register
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-midnight">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-sand-warm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#home" className="block px-3 py-2 text-midnight hover:text-earth-green">Home</a>
              <a href="#services" className="block px-3 py-2 text-midnight hover:text-earth-green">Services</a>
              <a href="#about" className="block px-3 py-2 text-midnight hover:text-earth-green">About</a>
              <a href="#contact" className="block px-3 py-2 text-midnight hover:text-earth-green">Contact</a>
              <div className="px-3 py-2 space-y-2">
                <Button variant="outline" className="w-full border-aqua text-aqua rounded-full">Login</Button>
                <Button className="w-full bg-orange-deep hover:bg-orange-deep-dark text-white rounded-full">Register</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
