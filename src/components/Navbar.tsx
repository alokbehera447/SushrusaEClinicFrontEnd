
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-medical-blue p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-medical-blue">SUSHRUSA</span>
            <span className="text-sm text-medical-gray">eClinic</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-medical-gray hover:text-medical-blue transition-colors">Home</a>
            <a href="#services" className="text-medical-gray hover:text-medical-blue transition-colors">Services</a>
            <a href="#about" className="text-medical-gray hover:text-medical-blue transition-colors">About</a>
            <a href="#contact" className="text-medical-gray hover:text-medical-blue transition-colors">Contact</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white">
              Login
            </Button>
            <Button className="bg-medical-green hover:bg-medical-green/90">
              Register
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#home" className="block px-3 py-2 text-medical-gray hover:text-medical-blue">Home</a>
              <a href="#services" className="block px-3 py-2 text-medical-gray hover:text-medical-blue">Services</a>
              <a href="#about" className="block px-3 py-2 text-medical-gray hover:text-medical-blue">About</a>
              <a href="#contact" className="block px-3 py-2 text-medical-gray hover:text-medical-blue">Contact</a>
              <div className="px-3 py-2 space-y-2">
                <Button variant="outline" className="w-full border-medical-blue text-medical-blue">Login</Button>
                <Button className="w-full bg-medical-green hover:bg-medical-green/90">Register</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
