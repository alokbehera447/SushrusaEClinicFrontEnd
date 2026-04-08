import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, Calendar, Video, FileText, Database, Pill, 
  ArrowRight, Zap, Sparkles, Shield, ChevronLeft, ChevronRight 
} from 'lucide-react';

const ServicesSection = () => {
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
    <section ref={sectionRef} className="py-8 sm:py-12 lg:py-16 bg-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-orange-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-orange-200">
            <div className="relative">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
            </div>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            <span className="text-xs sm:text-sm lg:text-lg font-bold text-orange-600 tracking-wide">COMPREHENSIVE SERVICES</span>
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight relative z-10">
              <span className="block">Everything You Need</span>
              <span className="block text-orange-600">
                All in One Place
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of healthcare with our <span className="text-orange-600 font-semibold">AI-powered ecosystem</span>. 
              From instant consultations to smart prescriptions, we've revolutionized every aspect of your healthcare journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4">
            <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg min-h-[48px]">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Get Started Today
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
            <Button variant="outline" className="w-full sm:w-auto bg-white border-2 border-orange-300 text-orange-600 hover:bg-orange-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 min-h-[48px]">
              <span className="flex items-center">
                Watch Demo
                <Video className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </span>
            </Button>
          </div>
        </div>

        {/* Services Grid - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-0 shadow-lg bg-white rounded-2xl sm:rounded-3xl transition-all duration-300 hover:shadow-xl flex flex-col h-[600px]"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              {/* Card Content */}
              <div className="relative z-10 flex flex-col h-full">
                <CardHeader className="text-center pb-4 sm:pb-6 pt-8 sm:pt-12 flex-shrink-0">
                  <div className="relative mx-auto mb-6 sm:mb-8">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${service.color} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      <service.icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 mb-3 sm:mb-4">
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
                    <ArrowRight className="w-4 h-4 ml-2" />
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
                  <Card className="group relative overflow-hidden border-0 shadow-lg bg-white rounded-2xl transition-all duration-300 hover:shadow-xl flex flex-col h-[500px]">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    {/* Card Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      <CardHeader className="text-center pb-4 pt-8 flex-shrink-0">
                        <div className="relative mx-auto mb-6">
                          <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                            <service.icon className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 mb-3">
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
                          <ArrowRight className="w-4 h-4 ml-2" />
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
                className="w-10 h-10 rounded-full bg-white/90 border-2 border-white/50 text-orange-600 hover:bg-orange-600 hover:text-white shadow-lg"
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
                className="w-10 h-10 rounded-full bg-white/90 border-2 border-white/50 text-orange-600 hover:bg-orange-600 hover:text-white shadow-lg"
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
                    ? 'bg-orange-500 shadow-md scale-110'
                    : 'bg-gray-300/60 hover:bg-orange-500/80 hover:scale-110'
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
              className="bg-white/90 px-4 py-2 rounded-full text-xs font-medium text-gray-600 hover:text-orange-600 transition-colors duration-300 border border-orange-200 hover:border-orange-500"
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
