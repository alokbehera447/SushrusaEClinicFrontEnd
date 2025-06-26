
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Shield } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-medical-blue-light/10 to-medical-green/10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                Your Digital
                <span className="text-medical-blue block">Healthcare</span>
                <span className="text-medical-green">Partner</span>
              </h1>
              <p className="text-lg text-medical-gray max-w-lg">
                Experience seamless healthcare with SUSHRUSA eClinic. Book consultations, 
                get prescriptions, and manage your health records all in one secure platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-medical-blue hover:bg-medical-blue/90 text-white px-8 py-3">
                <Calendar className="w-5 h-5 mr-2" />
                Book Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-medical-green text-medical-green hover:bg-medical-green hover:text-white px-8 py-3">
                <Video className="w-5 h-5 mr-2" />
                Login to eClinic
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-medical-green" />
                <span className="text-sm text-medical-gray">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-medical-blue" />
                <span className="text-sm text-medical-gray">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-medical-blue to-medical-green rounded-2xl p-8 text-white">
              <div className="space-y-6">
                <div className="bg-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">Virtual Consultation</h3>
                  <p className="text-white/90">Connect with certified doctors from the comfort of your home</p>
                </div>
                <div className="bg-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">Digital Prescriptions</h3>
                  <p className="text-white/90">Get instant e-prescriptions delivered to your pharmacy</p>
                </div>
                <div className="bg-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">Health Records</h3>
                  <p className="text-white/90">Secure access to your complete medical history</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
