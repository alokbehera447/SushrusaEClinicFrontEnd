
import React from 'react';
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-medical-blue p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">SUSHRUSA</span>
                <span className="text-sm text-gray-300 block">eClinic</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted digital healthcare partner, providing innovative solutions 
              for modern medical needs with compassion and excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="text-gray-300 hover:text-medical-blue transition-colors">Home</a></li>
              <li><a href="#services" className="text-gray-300 hover:text-medical-blue transition-colors">Services</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-medical-blue transition-colors">About Us</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-medical-blue transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-medical-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-medical-blue transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-medical-green transition-colors">Video Consultations</a></li>
              <li><a href="#" className="text-gray-300 hover:text-medical-green transition-colors">ePrescriptions</a></li>
              <li><a href="#" className="text-gray-300 hover:text-medical-green transition-colors">Health Records</a></li>
              <li><a href="#" className="text-gray-300 hover:text-medical-green transition-colors">Appointment Booking</a></li>
              <li><a href="#" className="text-gray-300 hover:text-medical-green transition-colors">Pharmacy Services</a></li>
              <li><a href="#" className="text-gray-300 hover:text-medical-green transition-colors">Emergency Support</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-medical-blue" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-medical-blue" />
                <span className="text-gray-300">info@sushrusa.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-medical-blue mt-0.5" />
                <span className="text-gray-300">
                  123 Healthcare Ave,<br />
                  Medical District, MD 12345
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 pt-4">
              <a href="#" className="text-gray-300 hover:text-medical-blue transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-medical-blue transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-medical-blue transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-medical-blue transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 SUSHRUSA eClinic. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            HIPAA Compliant • SSL Secured • ISO Certified
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
