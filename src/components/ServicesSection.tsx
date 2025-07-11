import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, Calendar, Video, FileText, Database, Pill, 
  ArrowRight, Zap, Sparkles, Shield, ChevronLeft, ChevronRight 
} from 'lucide-react';

const ServicesSection = () => {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([true, true, true, true, true, true]); // Initialize all cards as visible
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const services = [
    {
      icon: User,
      title: "Smart Registration",
      description: "AI-powered patient onboarding with instant verification and comprehensive health profiling",
      features: ["Instant Verification", "Health Risk Assessment", "Secure Data Storage"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      icon: Calendar,
      title: "Intelligent Scheduling",
      description: "Machine learning-based appointment optimization with real-time availability and smart reminders",
      features: ["AI Optimization", "Smart Reminders", "Real-time Sync"],
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      icon: Video,
      title: "HD Consultations",
      description: "Crystal-clear video calls with advanced diagnostics tools and real-time health monitoring",
      features: ["4K Video Quality", "Screen Sharing", "Recording Available"],
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },
    {
      icon: FileText,
      title: "Smart Prescriptions",
      description: "AI-assisted prescription writing with drug interaction checks and direct pharmacy integration",
      features: ["Drug Interaction Check", "Pharmacy Integration", "Digital Signatures"],
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50"
    },
    {
      icon: Database,
      title: "Unified Health Records",
      description: "Blockchain-secured medical records with instant access and complete history management",
      features: ["Blockchain Security", "Instant Access", "Complete History"],
      color: "from-indigo-500 to-blue-500",
      bgColor: "from-indigo-50 to-blue-50"
    },
    {
      icon: Pill,
      title: "Smart Pharmacy",
      description: "Automated medication management with delivery tracking and adherence monitoring",
      features: ["Automated Delivery", "Adherence Tracking", "Refill Reminders"],
      color: "from-teal-500 to-cyan-500",
      bgColor: "from-teal-50 to-cyan-50"
    }
  ];

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < services.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % services.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, services.length]);

  useEffect(() => {
    // For mobile, ensure cards are visible immediately
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // On mobile, show all cards immediately
      setVisibleCards([true, true, true, true, true, true]);
      return;
    }

    // Desktop intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            services.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => {
                  const newVisible = [...prev];
                  newVisible[index] = true;
                  return newVisible;
                });
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % services.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-[#E17726]/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-4 sm:left-10 w-48 h-48 sm:w-80 sm:h-80 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 glass px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-[#E17726]/20 hover-glow group cursor-pointer">
            <div className="relative">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
              <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-[#E17726] rounded-full animate-ping"></div>
            </div>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xs sm:text-sm lg:text-lg font-bold text-[#E17726] tracking-wide">COMPREHENSIVE SERVICES</span>
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-midnight leading-tight relative z-10">
              <span className="block">Everything You Need</span>
              <span className="block text-[#E17726] animate-gradient relative z-10">
                All in One Place
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of healthcare with our <span className="text-[#E17726] font-semibold">AI-powered ecosystem</span>. 
              From instant consultations to smart prescriptions, we've revolutionized every aspect of your healthcare journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4">
            <Button className="w-full sm:w-auto bg-gradient-orange hover:shadow-xl-colored text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg btn-modern hover-lift group min-h-[48px]">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Get Started Today
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button variant="outline" className="group relative overflow-hidden w-full sm:w-auto bg-white/80 backdrop-blur-sm border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-orange hover:text-white hover:border-[#E17726] px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-500 hover:shadow-xl-colored hover:scale-105 hover:-translate-y-1 min-h-[48px]">
              <span className="relative z-10 flex items-center">
                Watch Demo
                <Video className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            </Button>
          </div>
        </div>

        {/* Services Grid - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className={`group relative overflow-hidden border-0 shadow-modern bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl transition-all duration-700 hover:shadow-xl-colored flex flex-col h-[600px] ${
                visibleCards[index] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Card Content */}
              <div className="relative z-10 flex flex-col h-full">
                <CardHeader className="text-center pb-4 sm:pb-6 pt-8 sm:pt-12 flex-shrink-0">
                  <div className="relative mx-auto mb-6 sm:mb-8">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${service.color} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <service.icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#E17726] animate-pulse" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl sm:text-2xl font-bold text-midnight group-hover:text-[#E17726] transition-colors duration-300 mb-3 sm:mb-4">
                    {service.title}
                  </CardTitle>
                  
                  <p className="text-gray-600 leading-relaxed text-base sm:text-lg mb-4 sm:mb-6">
                    {service.description}
                  </p>
                </CardHeader>

                <CardContent className="px-6 sm:px-8 pb-8 sm:pb-10 flex-grow flex flex-col">
                  {/* Features List */}
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow">
                    {service.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex} 
                        className="flex items-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300"
                      >
                        <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full`}></div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:border-current transition-colors duration-300 min-h-[44px] flex-shrink-0 mt-auto"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Services Slider - Mobile/Tablet */}
        <div className="lg:hidden">
          <div 
            ref={sliderRef}
            className="relative overflow-hidden rounded-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {services.map((service, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2">
                  <Card className="group relative overflow-hidden border-0 shadow-modern bg-white/80 backdrop-blur-sm rounded-2xl transition-all duration-700 hover:shadow-xl-colored flex flex-col h-[500px]">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    {/* Card Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      <CardHeader className="text-center pb-4 pt-8 flex-shrink-0">
                        <div className="relative mx-auto mb-6">
                          <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                            <service.icon className="w-10 h-10 text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Sparkles className="w-5 h-5 text-[#E17726] animate-pulse" />
                          </div>
                        </div>
                        
                        <CardTitle className="text-xl font-bold text-midnight group-hover:text-[#E17726] transition-colors duration-300 mb-3">
                          {service.title}
                        </CardTitle>
                        
                        <p className="text-gray-600 leading-relaxed text-base mb-4">
                          {service.description}
                        </p>
                      </CardHeader>

                      <CardContent className="px-6 pb-8 flex-grow flex flex-col">
                        {/* Features List */}
                        <div className="space-y-2 mb-6 flex-grow">
                          {service.features.map((feature, featureIndex) => (
                            <div 
                              key={featureIndex} 
                              className="flex items-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300"
                            >
                              <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full`}></div>
                              <span className="font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action Button */}
                        <Button 
                          variant="outline" 
                          className="w-full group-hover:border-current transition-colors duration-300 min-h-[44px] flex-shrink-0 mt-auto"
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-2">
              <Button
                onClick={prevSlide}
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full glass border-2 border-white/50 text-[#E17726] hover:bg-[#E17726] hover:text-white shadow-lg hover-lift"
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-2">
              <Button
                onClick={nextSlide}
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full glass border-2 border-white/50 text-[#E17726] hover:bg-[#E17726] hover:text-white shadow-lg hover-lift"
                disabled={currentSlide === services.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center space-x-1.5 mt-6">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-gradient-orange shadow-md scale-110'
                    : 'bg-gray-300/60 hover:bg-[#E17726]/80 hover:scale-110'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play Control */}
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              variant="outline"
              size="sm"
              className="glass px-4 py-2 rounded-full text-xs font-medium text-gray-600 hover:text-[#E17726] transition-colors duration-300 border border-[#E17726]/20 hover:border-[#E17726]"
            >
              {isAutoPlaying ? '⏸️ Pause' : '▶️ Play'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
