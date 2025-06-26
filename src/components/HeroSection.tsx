
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Shield, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-sand-warm via-white to-sand-warm-dark py-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-earth-green/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-aqua/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-earth-green/10 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-earth-green" />
                <span className="text-sm font-medium text-earth-green">Modern Healthcare Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-midnight leading-tight">
                Your Digital
                <span className="text-earth-green block">Healthcare</span>
                <span className="text-aqua">Partner</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Experience seamless healthcare with SUSHRUSA eClinic. Book consultations, 
                get prescriptions, and manage your health records all in one secure platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-orange-deep hover:bg-orange-deep-dark text-white px-8 py-4 rounded-full shadow-modern transition-all duration-300 hover:scale-105">
                <Calendar className="w-5 h-5 mr-2" />
                Book Consultation
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-aqua text-aqua hover:bg-aqua hover:text-white px-8 py-4 rounded-full transition-all duration-300"
              >
                <Video className="w-5 h-5 mr-2" />
                Login to eClinic
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-earth-green" />
                <span className="text-sm text-gray-600 font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-aqua" />
                <span className="text-sm text-gray-600 font-medium">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Content - Modern Cards */}
          <div className="relative">
            <div className="grid gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-modern border border-sand-warm hover:shadow-lg transition-all duration-300 animate-float">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-earth-green/10 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-earth-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-midnight">Virtual Consultation</h3>
                    <p className="text-gray-600 text-sm">Connect with certified doctors instantly</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-modern border border-sand-warm hover:shadow-lg transition-all duration-300 animate-float" style={{animationDelay: '1s'}}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-aqua/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-aqua" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-midnight">Digital Prescriptions</h3>
                    <p className="text-gray-600 text-sm">Get instant e-prescriptions securely</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-modern border border-sand-warm hover:shadow-lg transition-all duration-300 animate-float" style={{animationDelay: '2s'}}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-deep/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-deep" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-midnight">Health Records</h3>
                    <p className="text-gray-600 text-sm">Access your complete medical history</p>
                  </div>
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
