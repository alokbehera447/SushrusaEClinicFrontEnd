import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Users, Award, Clock, Sparkles, Star, Shield } from 'lucide-react';
import WhyChooseSushrusaModal from '@/components/detail-pages/WhyChooseSushrusaModal';
import TechnologyShowcaseModal from '@/components/detail-pages/TechnologyShowcaseModal';

const ImageContentBlocks = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [showWhyChooseModal, setShowWhyChooseModal] = useState(false);
  const [showTechnologyModal, setShowTechnologyModal] = useState(false);

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

    // Preload images to prevent layout shifts
    const preloadImages = async () => {
      const imagePromises = contentBlocks.map(block => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // Don't fail on error
          img.src = block.image;
        });
      });
      
      await Promise.all(imagePromises);
      setImagesLoaded(true);
    };

    preloadImages();

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <>
    <section ref={sectionRef} className="py-8 sm:py-12 lg:py-16 bg-white relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {contentBlocks.map((block, index) => (
          <div 
            key={block.id} 
            className={`content-block flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center mb-16 sm:mb-20 lg:mb-32 ${
              index === contentBlocks.length - 1 ? 'mb-0' : ''
            } ${isMobile ? 'border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm' : 'bg-white/50 rounded-2xl p-4'}`}
            style={{ 
              minHeight: isMobile ? '300px' : '400px',
              opacity: imagesLoaded ? 1 : 0.8,
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            {/* Content */}
            <div className={`space-y-4 ${!isMobile ? 'lg:space-y-6' : ''} ${!isMobile && block.reversed ? 'lg:order-2' : ''}`}>
              {/* Badge */}
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                isMobile 
                  ? 'bg-orange-100' 
                  : 'bg-orange-50 px-6 py-3 space-x-3 border border-orange-200'
              }`}>
                <span className={`text-sm font-bold ${isMobile ? 'text-orange-600' : 'text-orange-600'}`}>{block.badge}</span>
              </div>

              <div className={`space-y-3 ${!isMobile ? 'lg:space-y-4' : ''}`}>
                <h2 className={`font-bold text-gray-900 ${
                  isMobile 
                    ? 'text-2xl' 
                    : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 leading-tight'
                }`}>
                  {block.title}
                </h2>
                
                <div className={`space-y-2 ${!isMobile ? 'lg:space-y-3' : ''}`}>
                  <h3 className={`font-semibold ${
                    isMobile 
                      ? 'text-lg text-orange-600' 
                      : 'text-lg sm:text-xl md:text-2xl font-semibold text-orange-600'
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
                onClick={() => {
                  if (block.buttonText === "Why choose SUSHRUSA") {
                    setShowWhyChooseModal(true);
                  } else if (block.buttonText === "Explore our technology") {
                    setShowTechnologyModal(true);
                  }
                }}
                className={`${
                  isMobile 
                    ? 'bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700'
                    : 'bg-white border-2 border-orange-300 text-orange-600 hover:bg-orange-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg h-auto transition-all duration-300'
                }`}
              >
                <span className="flex items-center">
                  {block.buttonText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </span>
              </Button>

              {/* Stats for first block */}
              {block.stats.length > 0 && (
                <div className={`grid grid-cols-2 gap-4 pt-4 ${!isMobile ? 'lg:gap-6 lg:pt-8' : ''}`}>
                  {block.stats.map((stat, statIndex) => (
                    <div key={statIndex} className={`${
                      isMobile 
                        ? 'bg-gray-50 p-4 rounded-lg'
                        : 'bg-gray-50 p-4 rounded-2xl'
                    }`}>
                      <div className="flex items-center space-y-2 flex-col">
                        <div className={`${
                          isMobile 
                            ? 'w-10 h-10 bg-orange-100 rounded-lg'
                            : 'w-12 h-12 bg-orange-100 rounded-xl'
                        } flex items-center justify-center`}>
                          <stat.icon className={`${
                            isMobile 
                              ? 'w-5 h-5 text-orange-600'
                              : 'w-6 h-6 text-orange-600'
                          }`} />
                        </div>
                        <div className={`${
                          isMobile 
                            ? 'text-xl font-bold text-gray-900'
                            : 'text-2xl font-bold text-gray-900'
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
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative">
                  {/* Main Image Container */}
                  <div className="aspect-[4/3] bg-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg relative group">
                    <img 
                      src={block.image} 
                      alt={block.imagePlaceholder}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.log('Image failed to load:', block.image);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent"></div>
                    
                    {/* Floating badge */}
                    <div className="absolute top-3 sm:top-6 left-3 sm:left-6 bg-white/90 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-md">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">SUSHRUSA eClinic</span>
                      </div>
                    </div>

                    {/* Quality Badge */}
                    <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 bg-white/90 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-gray-900">Premium</div>
                          <div className="text-xs text-gray-600">Quality</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
    
    {/* Modals */}
    <WhyChooseSushrusaModal 
      isOpen={showWhyChooseModal} 
      onClose={() => setShowWhyChooseModal(false)} 
    />
    <TechnologyShowcaseModal 
      isOpen={showTechnologyModal} 
      onClose={() => setShowTechnologyModal(false)} 
    />
  </>
  );
};

export default ImageContentBlocks;
