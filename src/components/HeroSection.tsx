
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Shield, Star, Users, Clock } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="bg-white py-16 lg:py-24 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-earth-green/5 to-aqua/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-earth-green/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-earth-green rounded-full"></div>
                <span className="text-sm font-medium text-earth-green">HEALTHCARE REIMAGINED</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-midnight leading-tight">
                  Specialist Consults.
                  <span className="text-earth-green block">Just a Click Away</span>
                </h1>
                
                <p className="text-lg md:text-xl text-midnight/70 leading-relaxed max-w-lg">
                  Instant access to verified doctors across departments—fast, secure, 
                  and built for every region. Quality healthcare at your fingertips.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-earth-green hover:bg-earth-green/90 text-white px-8 py-3 rounded-lg font-semibold text-base">
                <Calendar className="w-5 h-5 mr-2" />
                Book Consultation
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-aqua text-aqua hover:bg-aqua hover:text-white px-8 py-3 rounded-lg font-semibold text-base"
              >
                <Video className="w-5 h-5 mr-2" />
                Start Video Call
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-earth-green/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-earth-green" />
                </div>
                <span className="text-sm text-midnight/70 font-medium">HIPAA Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-aqua/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-aqua" />
                </div>
                <span className="text-sm text-midnight/70 font-medium">24/7 Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-earth-green/10 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-earth-green" />
                </div>
                <span className="text-sm text-midnight/70 font-medium">Top Rated</span>
              </div>
            </div>
          </div>

          {/* Right Content - Modern Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Main large image */}
              <div className="col-span-2 relative">
                <div className="bg-gradient-to-br from-sand-warm to-earth-green/10 rounded-2xl p-8 h-64 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:shadow-lg transition-all duration-300">
                  <img 
                    src="/placeholder.svg" 
                    alt="Doctor consultation" 
                    className="w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/20 to-transparent rounded-2xl"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-bold">Video Consultations</h3>
                    <p className="text-white/80">Connect instantly with specialists</p>
                  </div>
                </div>
              </div>

              {/* Smaller cards */}
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-sand-warm/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="w-12 h-12 bg-aqua/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-aqua" />
                </div>
                <h3 className="text-lg font-bold text-midnight mb-2">500+ Doctors</h3>
                <p className="text-midnight/60 text-sm">Verified specialists across all departments</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-soft border border-sand-warm/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="w-12 h-12 bg-earth-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-earth-green" />
                </div>
                <h3 className="text-lg font-bold text-midnight mb-2">100% Secure</h3>
                <p className="text-midnight/60 text-sm">Your health data is protected and encrypted</p>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-modern border border-sand-warm/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-earth-green/10 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-earth-green" />
                </div>
                <div>
                  <div className="text-xl font-bold text-midnight">4.9</div>
                  <div className="text-xs text-midnight/60">Patient Rating</div>
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
