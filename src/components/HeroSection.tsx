import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Shield, Star, Users, Clock, Play, Heart, ArrowRight, Sparkles, Zap, Award, MapPin } from 'lucide-react';
import BookConsultationModal from '@/components/detail-pages/BookConsultationModal';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="home" className="relative bg-gradient-hero overflow-hidden pt-20 sm:pt-24 lg:pt-28">
      {/* Background Elements - Keep Original Style */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient mesh */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-40"></div>
        
        {/* Top Animated Mesh Blobs - Original Style */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[500px] h-[200px] sm:w-[700px] sm:h-[250px] bg-gradient-to-br from-[#E17726]/50 via-[#FF8A56]/40 to-cyan-400/40 rounded-full blur-3xl opacity-80 animate-float-slow z-[1]"></div>
        <div className="absolute -top-32 right-[-40px] sm:right-[-60px] w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-cyan-400/50 to-purple-400/30 rounded-full blur-2xl opacity-70 animate-float animation-delay-700 z-[2]"></div>
        
        {/* Floating Elements - Original Style */}
        <div className="absolute top-8 left-4 sm:left-10 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-br from-[#E17726]/25 to-transparent rounded-full blur-3xl animate-float z-[1]"></div>
        <div className="absolute top-16 right-4 sm:right-20 w-72 h-72 sm:w-[400px] sm:h-[400px] bg-gradient-to-br from-cyan-400/25 to-transparent rounded-full blur-3xl animate-float animation-delay-300 z-[1]"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-purple-400/30 to-transparent rounded-full blur-3xl animate-float animation-delay-500 z-[1]"></div>
        
        {/* Interactive cursor glow */}
        <div 
          className="pointer-events-none absolute w-96 h-96 bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 rounded-full blur-3xl transition-all duration-1000 ease-out hidden lg:block z-[3]"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      {/* Clean Top Interactive Banner - No Background */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex items-center justify-center">
            {/* Single Moving Element */}
            <div className="flex items-center space-x-3 animate-slide-in-down">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="text-sm sm:text-base font-medium text-black">
                24/7 Superspecialist Care Available
              </span>
              <div className="hidden sm:flex items-center space-x-1 ml-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-black ml-1">4.9 (10k+ reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-0 sm:pb-1 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left Content */}
          <div className={`space-y-6 sm:space-y-8 ${isVisible ? 'animate-fade-in-left' : 'opacity-100'}`}>
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 sm:space-x-3 glass px-4 sm:px-6 py-2 sm:py-3 rounded-full hover-glow group cursor-pointer animate-slide-in-down border-2 border-[#E17726]/40 backdrop-blur-md">
              <div className="relative">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
                <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-[#E17726] rounded-full animate-ping"></div>
              </div>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xs sm:text-sm font-bold text-[#E17726] tracking-wide uppercase">Rural Healthcare</span>
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 px-3 py-1 rounded-full border border-gray-200 mt-2 animate-fade-in-up animation-delay-50">
              <Award className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-gray-700">Trusted by 10,000+ patients</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4 sm:space-y-6 animation-delay-100">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-midnight leading-[1.1] tracking-tight">
                <span className="block animate-fade-in-up">Superspeciality Care</span>
                <span className="block bg-gradient-to-r from-[#E17726] to-[#FF8A56] bg-clip-text text-transparent animate-fade-in-up animation-delay-50 pb-1">
                  Everywhere
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed animate-fade-in-up animation-delay-150 max-w-xl">
                Connecting rural India to top-tier <span className="text-[#E17726] font-semibold">superspeciality doctors</span> through advanced telemedicine and professional care centers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 animate-fade-in-up animation-delay-200">
              <Button 
                size="lg" 
                onClick={() => setShowBookingModal(true)}
                className="w-full sm:w-auto bg-gradient-orange text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg h-auto btn-modern hover-lift transition-all duration-300 hover:scale-105 group"
              >
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Book Consultation
              </Button>
              
              <Link to="/find-doctors" className="group">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-cyan-400/60 text-cyan-600 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg h-auto btn-modern hover-lift transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                  Find Doctors
                </Button>
              </Link>

              <Link to="/nearby-eclinics" className="group">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-emerald-400/60 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg h-auto btn-modern hover-lift transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                  Find Nearby E-Clinics
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Enhanced Visual */}
          <div className={`relative mt-8 lg:mt-0 ${isVisible ? 'animate-fade-in-right animation-delay-100' : 'opacity-100'}`}>
            {/* Floating 24x7 Badge - Hidden on Mobile */}
            <div className="absolute -top-4 -right-20 z-20 hidden lg:flex items-center space-x-2 bg-gradient-to-r from-[#E17726]/95 to-cyan-400/95 text-white px-4 py-2 rounded-full animate-fade-in-up animation-delay-150 border border-white/40 shadow-lg backdrop-blur-sm">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-xs tracking-wide">24x7 Superspecialist Access</span>
            </div>

            {/* Main Visual Container - Enhanced Size and Layout */}
            <div className="relative w-full max-w-xl mx-auto lg:mx-0">
              {/* Primary Card - Larger and Better Layout */}
              <div className="relative z-10 bg-white/30 backdrop-blur-lg rounded-3xl p-4 group shadow-2xl hover:shadow-3xl transition-all duration-500">
                {/* Video/Image Section - Increased Size */}
                <div className="relative rounded-2xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-500">
                  {/* Video Section - Using doctor_consult.mp4 */}
                  <div className="w-full h-56 sm:h-72 md:h-80 lg:h-96 bg-gradient-to-br from-[#E17726]/30 via-cyan-400/25 to-purple-400/30 flex items-center justify-center rounded-2xl relative overflow-hidden">
                    <video 
                      className="w-full h-full object-contain rounded-2xl"
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      poster="/img1.jpeg"
                    >
                      <source src="/odia_doctor.mp4" type="video/mp4" />
                      {/* Fallback content if video doesn't load */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-orange rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
                            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-midnight mb-1">Award-Winning Care</h3>
                            <p className="text-sm sm:text-base text-gray-600">HD Video Consultations</p>
                          </div>
                        </div>
                      </div>
                    </video>
                  </div>

                  {/* Enhanced Interactive Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-midnight/20 rounded-2xl">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover-scale animate-pulse-glow shadow-xl border border-white/50">
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Quick Actions - Better Layout */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#E17726]/20 to-transparent p-4 rounded-xl hover-lift cursor-pointer group border border-[#E17726]/30 hover:border-[#E17726]/50 transition-all duration-300 backdrop-blur-sm">
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-[#E17726] mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-sm sm:text-base font-semibold text-midnight">Instant Access</div>
                    <div className="text-xs text-gray-500 mt-1">24/7 Available</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-400/20 to-transparent p-4 rounded-xl hover-lift cursor-pointer group border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-sm sm:text-base font-semibold text-midnight">Trusted Care</div>
                    <div className="text-xs text-gray-500 mt-1">Expert Doctors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Call-to-Action Buttons Section */}
      <div className="mt-8 pt-8 pb-4 md:pb-6 px-0 bg-gradient-to-r from-amber-50/80 to-amber-100/80 relative overflow-hidden backdrop-blur-sm w-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="medical-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#medical-pattern)" />
          </svg>
        </div>
      </div>
      
      {/* Modals */}
      <BookConsultationModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)} 
      />
    </section>
  );
};

export default HeroSection;

