import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Shield, Star, Users, Clock, Play, Heart, ArrowRight, Sparkles, Zap, Award } from 'lucide-react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="home" className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Main gradient mesh */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-[#E17726]/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-4 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl animate-float animation-delay-500"></div>
        
        {/* Interactive cursor glow - hidden on mobile */}
        <div 
          className="pointer-events-none absolute w-96 h-96 bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 rounded-full blur-3xl transition-all duration-1000 ease-out hidden lg:block"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Content */}
          <div className={`space-y-6 sm:space-y-8 ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 sm:space-x-3 glass px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-soft hover-glow group cursor-pointer animate-slide-in-down border-2 border-[#E17726]/40 backdrop-blur-md">
              <div className="relative">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
                <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-[#E17726] rounded-full animate-ping"></div>
              </div>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xs sm:text-sm font-bold text-[#E17726] tracking-wide uppercase">Rural Healthcare</span>
            </div>
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 px-3 py-1 rounded-full shadow border border-gray-200 mt-2 animate-fade-in-up animation-delay-150">
              <Award className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-gray-700">Trusted by 10,000+ patients</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4 sm:space-y-6 animation-delay-200">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-midnight leading-[0.9] tracking-tight drop-shadow-xl">
                <span className="block animate-fade-in-up">Superspeciality Care</span>
                <span className="block bg-gradient-to-r from-[#E17726] to-[#FF8A56] bg-clip-text text-transparent animate-fade-in-up animation-delay-100">
                  Everywhere
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed animate-fade-in-up animation-delay-300 max-w-xl">
                Connecting rural India to top-tier <span className="text-[#E17726] font-semibold">superspeciality doctors</span> through advanced telemedicine and professional care centers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 animate-fade-in-up animation-delay-400">
              <Link to="/login" className="group">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-orange hover:shadow-xl-colored text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg h-auto btn-modern hover-lift transition-all duration-300 group-hover:scale-105"
                >
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Book Consultation
                </Button>
              </Link>
              
              <Link to="/find-doctors" className="group">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto glass border-2 border-cyan-400 text-cyan-600 hover:bg-gradient-blue hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg h-auto btn-modern hover-lift transition-all duration-300"
                >
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                  Find Doctors
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Enhanced Visual */}
          <div className={`relative mt-8 lg:mt-0 ${isVisible ? 'animate-fade-in-right animation-delay-200' : 'opacity-0'}`}>
            {/* Floating 24x7 Badge */}
            <div className="absolute -top-8 right-0 z-20 flex items-center space-x-2 bg-gradient-to-r from-[#E17726]/90 to-cyan-400/90 text-white px-4 py-2 rounded-full shadow-lg animate-fade-in-up animation-delay-300 border-2 border-white/30">
              <Clock className="w-5 h-5" />
              <span className="font-bold text-sm tracking-wide">24x7 Superspecialist Access</span>
            </div>
            {/* Main Visual Container with proper relative positioning */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0">
              {/* Primary Card */}
              <div className="relative z-10 glass rounded-3xl p-4 sm:p-6 shadow-xl-colored hover-lift group">
                {/* Video/Image Section */}
                <div className="relative rounded-2xl overflow-hidden mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-500">
                  {/* Fallback Image */}
                  <div className="w-full h-48 sm:h-64 md:h-72 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 flex items-center justify-center rounded-2xl">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-orange rounded-full flex items-center justify-center mx-auto shadow-xl animate-pulse-glow">
                        <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-midnight mb-1">Award-Winning Care</h3>
                        <p className="text-sm sm:text-base text-gray-600">HD Video Consultations</p>
                      </div>
                    </div>
                  </div>
                  {/* Interactive Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-midnight/20 rounded-2xl">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 glass-dark rounded-full flex items-center justify-center cursor-pointer hover-scale animate-pulse-glow">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-1" />
                    </div>
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-gradient-to-br from-[#E17726]/5 to-transparent p-2 sm:p-3 rounded-xl hover-lift cursor-pointer group">
                    <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-[#E17726] mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-xs sm:text-sm font-semibold text-midnight">Instant Access</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-400/5 to-transparent p-2 sm:p-3 rounded-xl hover-lift cursor-pointer group">
                    <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-xs sm:text-sm font-semibold text-midnight">Trusted Care</div>
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

