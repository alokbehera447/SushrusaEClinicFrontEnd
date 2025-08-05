import React from 'react';
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '#services' },
    { name: 'About Us', href: '#about' },
    { name: 'Contact', href: '#contact' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' }
  ];

  return (
    <footer id="contact" className="bg-midnight text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <img 
                src="/sushrusa_logo_1-Photoroom.png" 
                alt="Sushrusa Logo" 
                className="h-16 w-16 sm:h-18 sm:w-18 object-contain"
              />
              <div>
                <span className="text-xl sm:text-2xl font-bold">SUSHRUSA</span>
                <span className="text-sm text-white/60 block">eClinic Platform</span>
              </div>
            </div>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed">
              Your trusted digital healthcare partner, delivering innovative solutions 
              for modern medical care with compassion and excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Quick Links</h3>
            <ul className="space-y-3 sm:space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-white/70 hover:text-[#E17726] transition-colors duration-300 text-base sm:text-lg block py-1 min-h-[44px] flex items-center"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Our Services</h3>
            <ul className="space-y-3 sm:space-y-4">
              {['Video Consultations', 'Digital Prescriptions', 'Health Records', 'Smart Scheduling', 'Pharmacy Network', 'Emergency Support'].map((service) => (
                <li key={service}>
                  <a 
                    href="#" 
                    className="text-white/70 hover:text-aqua transition-colors duration-300 text-base sm:text-lg block py-1 min-h-[44px] flex items-center"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E17726]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#E17726]" />
                </div>
                <a 
                  href="tel:+916370511060"
                  className="text-white/70 text-base sm:text-lg hover:text-[#E17726] transition-colors duration-300 min-h-[44px] flex items-center"
                >
                  +91 6370 511 060
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-aqua/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-aqua" />
                </div>
                <a 
                  href="mailto:care@sushrusahealthcare.com"
                  className="text-white/70 text-base sm:text-lg hover:text-aqua transition-colors duration-300 min-h-[44px] flex items-center"
                >
                  care@sushrusahealthcare.com
                </a>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E17726]/20 rounded-xl flex items-center justify-center mt-1 flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#E17726]" />
                </div>
                <span className="text-white/70 text-base sm:text-lg leading-relaxed">
                  HIG 11, 2ND LANE, near Kharavel park,<br />
                  Phase I, Khandagiri, Bhubaneswar,<br />
                  Odisha 751030
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3 sm:space-x-4 pt-4 sm:pt-6">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Linkedin, href: '#' }
              ].map(({ Icon, href }, index) => (
                <a 
                  key={index} 
                  href={href} 
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-aqua hover:bg-aqua/20 transition-all duration-300 hover-lift"
                  aria-label={`Follow us on ${Icon.name}`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 sm:mt-12 pt-4 sm:pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-white/60 text-base sm:text-lg text-center md:text-left">
            © 2024 SUSHRUSA eClinic. All rights reserved.
          </p>
          <p className="text-white/60 text-base sm:text-lg text-center md:text-right">
            HIPAA Compliant • SSL Secured • ISO Certified
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
