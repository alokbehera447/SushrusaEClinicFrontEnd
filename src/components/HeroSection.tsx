
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Shield, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-sand-warm/30 via-white to-sand-warm/50 py-24 relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-earth-green/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-aqua/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-3 bg-earth-green/10 px-6 py-3 rounded-full border border-earth-green/20">
                <div className="w-2 h-2 bg-earth-green rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-earth-green tracking-wide">MODERN HEALTHCARE PLATFORM</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-midnight leading-[0.9] tracking-tight">
                  Your Digital
                  <span className="text-earth-green block">Healthcare</span>
                  <span className="text-aqua">Companion</span>
                </h1>
                
                <p className="text-xl text-midnight/70 max-w-xl leading-relaxed font-medium">
                  Experience seamless healthcare with SUSHRUSA eClinic. Connect with certified doctors, 
                  get instant prescriptions, and manage your health records securely.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-earth-green hover:bg-earth-green-dark text-white px-10 py-6 rounded-2xl font-semibold text-lg shadow-modern transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <Calendar className="w-6 h-6 mr-3" />
                Book Consultation
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-aqua text-aqua hover:bg-aqua hover:text-white px-10 py-6 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <Video className="w-6 h-6 mr-3" />
                Access eClinic
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-10 pt-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-earth-green/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-earth-green" />
                </div>
                <span className="text-sm text-midnight/70 font-medium">HIPAA Secure</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-aqua/10 rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5 text-aqua" />
                </div>
                <span className="text-sm text-midnight/70 font-medium">24/7 Available</span>
              </div>
            </div>
          </div>

          {/* Right Content - Clean Feature Cards */}
          <div className="relative">
            <div className="space-y-4">
              {[
                { icon: Video, title: "Instant Video Consultations", desc: "Connect with doctors in seconds", color: "earth-green", delay: "0s" },
                { icon: Shield, title: "Secure Health Records", desc: "Your data protected with encryption", color: "aqua", delay: "0.2s" },
                { icon: Calendar, title: "Smart Appointment System", desc: "AI-powered scheduling made easy", color: "earth-green", delay: "0.4s" }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/50 hover:shadow-modern transition-all duration-500 hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 ${feature.color === 'earth-green' ? 'bg-earth-green/10' : 'bg-aqua/10'} rounded-2xl flex items-center justify-center`}>
                      <feature.icon className={`w-8 h-8 ${feature.color === 'earth-green' ? 'text-earth-green' : 'text-aqua'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-midnight mb-2">{feature.title}</h3>
                      <p className="text-midnight/60 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
