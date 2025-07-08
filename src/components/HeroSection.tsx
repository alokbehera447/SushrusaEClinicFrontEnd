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
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#E17726]/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl animate-float animation-delay-500"></div>
        
        {/* Interactive cursor glow */}
        <div 
          className="pointer-events-none absolute w-96 h-96 bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full shadow-soft hover-glow group cursor-pointer animate-slide-in-down">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
                <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
              </div>
              <Sparkles className="w-4 h-4 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-sm font-bold text-[#E17726] tracking-wide">RURAL HEALTHCARE</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-6 animation-delay-200">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-midnight leading-[0.9] tracking-tight">
                <span className="block animate-fade-in-up">Specialist Care</span>
                <span className="block bg-gradient-to-r from-[#E17726] to-[#FF8A56] bg-clip-text text-transparent animate-fade-in-up animation-delay-100">
                  Everywhere
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed animate-fade-in-up animation-delay-300">
                Bringing <span className="text-[#E17726] font-semibold">multispecialty doctors</span> to rural India through professional consultation centers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up animation-delay-400">
              <Link to="/login" className="group">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-orange hover:shadow-xl-colored text-white px-8 py-4 rounded-2xl font-bold text-lg h-auto btn-modern hover-lift transition-all duration-300 group-hover:scale-105"
                >
                  <Calendar className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Book Consultation
                </Button>
              </Link>
              
              <Link to="/find-doctors" className="group">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto glass border-2 border-cyan-400 text-cyan-600 hover:bg-gradient-blue hover:text-white px-8 py-4 rounded-2xl font-bold text-lg h-auto btn-modern hover-lift transition-all duration-300"
                >
                  <Video className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  Find Specialists
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Enhanced Visual */}
          <div className={`relative mt-12 lg:mt-0 ${isVisible ? 'animate-fade-in-right animation-delay-200' : 'opacity-0'}`}>
            {/* Main Visual Container with proper relative positioning */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0">
              {/* Primary Card */}
              <div className="relative z-10 glass rounded-3xl p-6 shadow-xl-colored hover-lift group">
                {/* Video/Image Section */}
                <div className="relative rounded-2xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-500">
                  <video 
                    className="w-full h-64 md:h-72 object-cover"
                    autoPlay 
                    muted 
                    loop
                    playsInline
                  >
                    <source src="https://videos.pexels.com/video-files/8375453/8375453-uhd_2732_1440_25fps.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Video Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">Professional Centers</h3>
                      <p className="text-white/90">HD Video Consultations</p>
                    </div>
                  </div>
                  
                  {/* Interactive Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-midnight/20">
                    <div className="w-16 h-16 glass-dark rounded-full flex items-center justify-center cursor-pointer hover-scale animate-pulse-glow">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-[#E17726]/5 to-transparent p-3 rounded-xl hover-lift cursor-pointer group">
                    <Zap className="w-6 h-6 text-[#E17726] mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-sm font-semibold text-midnight">Instant Access</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-400/5 to-transparent p-3 rounded-xl hover-lift cursor-pointer group">
                    <Heart className="w-6 h-6 text-cyan-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-sm font-semibold text-midnight">Trusted Care</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements - Fixed positioning relative to container */}
              {/* <div className="absolute top-4 right-4 z-20 glass p-3 rounded-xl shadow-modern hover-scale cursor-pointer animate-float">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-orange rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-midnight">4.9★</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 z-20 glass p-3 rounded-xl shadow-modern hover-scale cursor-pointer animate-float animation-delay-300">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-blue rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-midnight">200+</div>
                    <div className="text-xs text-gray-600">Specialists</div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

