import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Users, Award, Clock, Sparkles, Star, Shield } from 'lucide-react';

const ImageContentBlocks = () => {
  const [visibleBlocks, setVisibleBlocks] = useState<boolean[]>([true, true, true]); // Initialize all blocks as visible
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
    // For mobile, ensure blocks are visible immediately
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // On mobile, show all blocks immediately
      setVisibleBlocks([true, true, true]);
      return;
    }

    // Desktop intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const blockIndex = parseInt(entry.target.getAttribute('data-block-index') || '0');
            setTimeout(() => {
              setVisibleBlocks(prev => {
                const newVisible = [...prev];
                newVisible[blockIndex] = true;
                return newVisible;
              });
            }, blockIndex * 300);
          }
        });
      },
      { threshold: 0.2 }
    );

    const blockElements = document.querySelectorAll('.content-block');
    blockElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {contentBlocks.map((block, index) => (
          <div 
            key={block.id} 
            data-block-index={index}
            className={`content-block flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center mb-16 sm:mb-20 lg:mb-32 ${
              index === contentBlocks.length - 1 ? 'mb-0' : ''
            } ${window.innerWidth <= 768 ? 'opacity-100' : (visibleBlocks[index] ? 'animate-fade-in-up' : 'opacity-100')}`}
            style={{ 
              minHeight: '300px'
            }}
          >
            {/* Content */}
            <div className={`space-y-6 sm:space-y-8 ${block.reversed ? 'lg:order-2' : ''} ${
              window.innerWidth <= 768 ? 'opacity-100' : (visibleBlocks[index] ? (block.reversed ? 'animate-fade-in-right' : 'animate-fade-in-left') : 'opacity-100')
            } animation-delay-200`}>
              {/* Badge */}
              <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full border border-[#E17726]/20 hover-glow group cursor-pointer">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
                </div>
                <Sparkles className="w-4 h-4 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm font-bold text-[#E17726] tracking-wide">{block.badge}</span>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-midnight leading-tight">
                  {block.title}
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#E17726]">
                    {block.subtitle}
                  </h3>
                  
                  <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                    {block.description}
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="lg" 
                className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-orange hover:text-white hover:border-[#E17726] px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg h-auto transition-all duration-500 hover:shadow-xl-colored hover:scale-105 hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center">
                  {block.buttonText}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              </Button>

              {/* Stats for first block */}
              {block.stats.length > 0 && (
                <div className="grid grid-cols-2 gap-6 pt-8">
                  {block.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="glass p-4 rounded-2xl hover-lift group cursor-pointer">
                      <div className="flex items-center space-y-2 flex-col">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <stat.icon className="w-6 h-6 text-[#E17726] group-hover:text-cyan-600 transition-colors duration-300" />
                        </div>
                        <div className="text-2xl font-black text-midnight group-hover:text-[#E17726] transition-colors duration-300">
                          {stat.value}
                        </div>
                        <div className="text-sm font-medium text-gray-600 text-center">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image */}
            <div className={`relative ${block.reversed ? 'lg:order-1' : ''} ${
              window.innerWidth <= 768 ? 'opacity-100' : (visibleBlocks[index] ? (block.reversed ? 'animate-fade-in-left' : 'animate-fade-in-right') : 'opacity-100')
            } animation-delay-400`}>
              <div className="relative">
                {/* Main Image Container */}
                <div className="aspect-[4/3] sm:aspect-[4/3] glass rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl-colored relative group hover-lift">
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
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageContentBlocks;
