import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Users, Award, Clock, Sparkles, Star, Shield } from 'lucide-react';

const ImageContentBlocks = () => {
  const [isMobile, setIsMobile] = useState(true); // Start with mobile assumption to ensure visibility
  const sectionRef = useRef<HTMLElement>(null);

  const contentBlocks = [
    {
      id: 1,
      title: "Healing starts here",
      subtitle: "The right answers the first time",
      description: "Effective treatment depends on getting the right diagnosis. Our experts diagnose and treat the toughest medical challenges.",
      buttonText: "Why choose SUSHRUSA",
      image: "/img1.jpeg",
      imagePlaceholder: "Healthcare professional with patient",
      reversed: false,
      badge: "EXPERT CARE",
      stats: [
        { icon: Heart, value: "500+", label: "Verified Doctors" },
        { icon: Users, value: "10k+", label: "Happy Patients" }
      ]
    },
    {
      id: 2,
      title: "World-class care for global patients",
      subtitle: "Excellence in every consultation",
      description: "We make it easy for patients around the world to get care from SUSHRUSA eClinic. Experience premium healthcare from anywhere.",
      buttonText: "International services",
      image: "/img2.jpeg",
      imagePlaceholder: "Global healthcare connectivity",
      reversed: true,
      badge: "GLOBAL REACH",
      stats: []
    },
    {
      id: 3,
      title: "Advanced medical technology",
      subtitle: "Innovation meets compassion",
      description: "Our state-of-the-art digital platform combines cutting-edge technology with personalized care to deliver exceptional healthcare experiences.",
      buttonText: "Explore our technology",
      image: "/medical-technology.svg",
      imagePlaceholder: "Medical technology and innovation",
      reversed: false,
      badge: "INNOVATION",
      stats: []
    }
  ];

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Background Elements - Desktop Only */}
      <div className="hidden lg:block absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {contentBlocks.map((block, index) => (
          <div 
            key={block.id} 
            className={`content-block flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center mb-16 sm:mb-20 lg:mb-32 ${
              index === contentBlocks.length - 1 ? 'mb-0' : ''
            } ${isMobile ? 'border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm' : 'opacity-100 bg-white/50 rounded-2xl p-4'}`}
            style={{ 
              minHeight: isMobile ? '300px' : '400px'
            }}
          >
            {/* Content */}
            <div className={`space-y-4 ${!isMobile ? 'lg:space-y-6 lg:space-y-8' : ''} ${!isMobile && block.reversed ? 'lg:order-2' : ''}`}>
              {/* Badge */}
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                isMobile 
                  ? 'bg-orange-100' 
                  : 'glass px-6 py-3 space-x-3 border border-[#E17726]/20 hover-glow group cursor-pointer'
              }`}>
                {!isMobile && (
                  <>
                    <div className="relative">
                      <div className="w-3 h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
                    </div>
                    <Sparkles className="w-4 h-4 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
                  </>
                )}
                <span className={`text-sm font-bold ${isMobile ? 'text-orange-600' : 'text-[#E17726] tracking-wide'}`}>{block.badge}</span>
              </div>

              <div className={`space-y-3 ${!isMobile ? 'lg:space-y-4 lg:space-y-6' : ''}`}>
                <h2 className={`font-bold text-gray-900 ${
                  isMobile 
                    ? 'text-2xl' 
                    : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-midnight leading-tight'
                }`}>
                  {block.title}
                </h2>
                
                <div className={`space-y-2 ${!isMobile ? 'lg:space-y-3 lg:space-y-4' : ''}`}>
                  <h3 className={`font-semibold ${
                    isMobile 
                      ? 'text-lg text-orange-600' 
                      : 'text-lg sm:text-xl md:text-2xl font-semibold text-[#E17726]'
                  }`}>
                    {block.subtitle}
                  </h3>
                  
                  <p className={`text-gray-600 ${
                    isMobile 
                      ? 'text-base' 
                      : 'text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl'
                  }`}>
                    {block.description}
                  </p>
                </div>
              </div>

                            <Button 
                variant="outline" 
                size="lg" 
                className={`${
                  isMobile 
                    ? 'bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold'
                    : 'group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-orange hover:text-white hover:border-[#E17726] px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg h-auto transition-all duration-500 hover:shadow-xl-colored hover:scale-105 hover:-translate-y-1'
                }`}
              >
                <span className={`flex items-center ${!isMobile ? 'relative z-10' : ''}`}>
                  {block.buttonText}
                  <ArrowRight className={`w-5 h-5 ml-2 ${!isMobile ? 'group-hover:translate-x-2 transition-transform duration-300' : ''}`} />
                </span>
                {!isMobile && (
                  <div className="absolute inset-0 bg-gradient-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                )}
              </Button>

              {/* Stats for first block */}
              {block.stats.length > 0 && (
                <div className={`grid grid-cols-2 gap-4 pt-4 ${!isMobile ? 'lg:gap-6 lg:pt-8' : ''}`}>
                  {block.stats.map((stat, statIndex) => (
                    <div key={statIndex} className={`${
                      isMobile 
                        ? 'bg-gray-50 p-4 rounded-lg'
                        : 'glass p-4 rounded-2xl hover-lift group cursor-pointer'
                    }`}>
                      <div className="flex items-center space-y-2 flex-col">
                        <div className={`${
                          isMobile 
                            ? 'w-10 h-10 bg-orange-100 rounded-lg'
                            : 'w-12 h-12 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-xl group-hover:scale-110 transition-transform duration-300'
                        } flex items-center justify-center`}>
                          <stat.icon className={`${
                            isMobile 
                              ? 'w-5 h-5 text-orange-600'
                              : 'w-6 h-6 text-[#E17726] group-hover:text-cyan-600 transition-colors duration-300'
                          }`} />
                        </div>
                        <div className={`${
                          isMobile 
                            ? 'text-xl font-bold text-gray-900'
                            : 'text-2xl font-black text-midnight group-hover:text-[#E17726] transition-colors duration-300'
                        }`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 text-center">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image */}
            <div className={`${!isMobile ? `relative ${block.reversed ? 'lg:order-1' : ''}` : 'mt-4'}`}>
              {isMobile ? (
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={block.image} 
                    alt={block.imagePlaceholder}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', block.image);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              ) : (
                <div className="relative">
                  {/* Main Image Container */}
                  <div className="aspect-[4/3] sm:aspect-[4/3] glass rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl-colored relative group hover-lift bg-gradient-to-br from-gray-100 to-gray-200">
                    <img 
                      src={block.image} 
                      alt={block.imagePlaceholder}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        console.log('Image failed to load:', block.image);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight/30 via-transparent to-transparent"></div>
                    
                    {/* Floating badge */}
                    <div className="absolute top-3 sm:top-6 left-3 sm:left-6 glass p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-modern hover-scale cursor-pointer animate-float">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#E17726] rounded-full animate-pulse"></div>
                        <span className="text-xs sm:text-sm font-bold text-midnight">SUSHRUSA eClinic</span>
                      </div>
                    </div>

                    {/* Quality Badge */}
                    <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 glass p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-modern hover-scale cursor-pointer animate-float animation-delay-500">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-orange rounded-lg flex items-center justify-center">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-midnight">Premium</div>
                          <div className="text-xs text-gray-600">Quality</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Decorative Elements */}
                  <div className="absolute -top-3 sm:-top-6 -right-3 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-2xl sm:rounded-3xl hover-scale cursor-pointer animate-float"></div>
                  <div className="absolute -bottom-3 sm:-bottom-6 -left-3 sm:-left-6 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-[#E17726]/20 to-transparent rounded-xl sm:rounded-2xl hover-scale cursor-pointer animate-float animation-delay-300"></div>
                  
                  {/* Security Badge for middle image */}
                  {block.id === 2 && (
                    <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-8 glass p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-modern hover-scale cursor-pointer animate-float z-10">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-blue rounded-lg sm:rounded-xl flex items-center justify-center">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-midnight">Secure</div>
                          <div className="text-xs text-gray-600">Platform</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageContentBlocks;
