import React from 'react';
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-midnight text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-[#E17726] p-3 rounded-2xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold">SUSHRUSA</span>
                <span className="text-sm text-white/60 block">eClinic Platform</span>
              </div>
            </div>
            <p className="text-white/70 text-lg leading-relaxed">
              Your trusted digital healthcare partner, delivering innovative solutions 
              for modern medical care with compassion and excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {['Home', 'Services', 'About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/70 hover:text-[#E17726] transition-colors duration-300 text-lg">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Our Services</h3>
            <ul className="space-y-4">
              {['Video Consultations', 'Digital Prescriptions', 'Health Records', 'Smart Scheduling', 'Pharmacy Network', 'Emergency Support'].map((service) => (
                <li key={service}>
                  <a href="#" className="text-white/70 hover:text-aqua transition-colors duration-300 text-lg">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-6">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#E17726]/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[#E17726]" />
                </div>
                <span className="text-white/70 text-lg">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-aqua/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-aqua" />
                </div>
                <span className="text-white/70 text-lg">hello@sushrusa.com</span>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#E17726]/20 rounded-xl flex items-center justify-center mt-1">
                  <MapPin className="w-6 h-6 text-[#E17726]" />
                </div>
                <span className="text-white/70 text-lg leading-relaxed">
                  123 Healthcare Avenue<br />
                  Medical District, MD 12345
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 pt-6">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <a key={index} href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-aqua hover:bg-aqua/20 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-lg">
            © 2024 SUSHRUSA eClinic. All rights reserved.
          </p>
          <p className="text-white/60 text-lg mt-2 md:mt-0">
            HIPAA Compliant • SSL Secured • ISO Certified
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
