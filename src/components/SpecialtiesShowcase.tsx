import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Brain, 
  Eye, 
  Bone, 
  Baby, 
  Stethoscope,
  Activity,
  Pill,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const SpecialtiesShowcase = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const specialties = [
    {
      icon: Heart,
      title: "Cardiology",
      description: "Expert heart care and cardiovascular health",
      patients: "2,500+ patients treated",
      image: "/cardiology.png",
      altText: "Cardiology specialist consultation"
    },
    {
      icon: Brain,
      title: "Neurology",
      description: "Advanced neurological care and treatment",
      patients: "1,800+ patients treated",
      image: "/neurology.png",
      altText: "Neurological examination"
    },
    {
      icon: Eye,
      title: "Ophthalmology",
      description: "Comprehensive eye care and vision health",
      patients: "3,200+ patients treated",
      image: "/ophthalmology.png",
      altText: "Eye examination"
    },
    {
      icon: Bone,
      title: "Orthopedics",
      description: "Bone, joint, and muscle health expertise",
      patients: "2,100+ patients treated",
      image: "/orthopedics.png",
      altText: "Orthopedic consultation"
    },
    {
      icon: Baby,
      title: "Pediatrics",
      description: "Specialized care for children and infants",
      patients: "4,000+ patients treated",
      image: "/pediatrics.png",
      altText: "Pediatric care"
    },
    {
      icon: Stethoscope,
      title: "General Medicine",
      description: "Primary care and general health management",
      patients: "5,500+ patients treated",
      image: "/general_medicine.png",
      altText: "General consultation"
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

    if (isLeftSwipe && currentSlide < Math.ceil(specialties.length / 2) - 1) {
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
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(specialties.length / 2));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, specialties.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(specialties.length / 2));
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(specialties.length / 2)) % Math.ceil(specialties.length / 2));
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-8 sm:py-12 lg:py-8 bg-gradient-to-b from-white to-sand-warm/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 glass px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-[#E17726]/20 hover-glow group cursor-pointer">
            <div className="relative">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
              <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-[#E17726] rounded-full animate-ping"></div>
            </div>
            <Sparkles className="w-4 h-4 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xs sm:text-sm lg:text-lg font-bold text-[#E17726] tracking-wide">MEDICAL SPECIALTIES</span>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-midnight leading-tight">
              Expert care across
              <span className="text-[#E17726] block">all specialties</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-midnight/70 max-w-3xl mx-auto leading-relaxed">
              Our board-certified specialists provide world-class care across multiple medical disciplines, 
              ensuring you receive the right treatment from the right expert.
            </p>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
          {specialties.map((specialty, index) => (
            <Card key={index} className="group hover:shadow-modern transition-all duration-500 hover:-translate-y-3 border-0 shadow-soft bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                {/* Image Section */}
                <div className="aspect-[4/3] bg-gradient-to-br from-[#E17726]/5 to-aqua/5 relative overflow-hidden">
                  <img 
                    src={specialty.image} 
                    alt={specialty.altText}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/40 via-transparent to-transparent"></div>
                  
                  {/* Icon overlay */}
                  <div className="absolute top-6 left-6 w-14 h-14 bg-white/90 rounded-2xl flex items-center justify-center">
                    <specialty.icon className="w-7 h-7 text-[#E17726]" />
                  </div>
                  
                  {/* Patient count */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2">
                      <p className="text-sm font-medium text-midnight">{specialty.patients}</p>
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-midnight mb-3 group-hover:text-[#E17726] transition-colors duration-300">
                    {specialty.title}
                  </h3>
                  <p className="text-midnight/70 leading-relaxed text-base sm:text-lg">
                    {specialty.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile/Tablet Slider */}
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
              {Array.from({ length: Math.ceil(specialties.length / 2) }, (_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0 px-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {specialties.slice(slideIndex * 2, slideIndex * 2 + 2).map((specialty, index) => (
                      <Card key={index} className="group hover:shadow-modern transition-all duration-500 hover:-translate-y-2 border-0 shadow-soft bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                          {/* Image Section */}
                          <div className="aspect-[4/3] bg-gradient-to-br from-[#E17726]/5 to-aqua/5 relative overflow-hidden">
                            <img 
                              src={specialty.image} 
                              alt={specialty.altText}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-midnight/40 via-transparent to-transparent"></div>
                            
                            {/* Icon overlay */}
                            <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center">
                              <specialty.icon className="w-6 h-6 text-[#E17726]" />
                            </div>
                            
                            {/* Patient count */}
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                                <p className="text-xs font-medium text-midnight">{specialty.patients}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Content Section */}
                          <div className="p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-midnight mb-2 group-hover:text-[#E17726] transition-colors duration-300">
                              {specialty.title}
                            </h3>
                            <p className="text-midnight/70 leading-relaxed text-sm sm:text-base">
                              {specialty.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2">
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

            <div className="absolute top-1/2 -translate-y-1/2 right-2">
              <Button
                onClick={nextSlide}
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full glass border-2 border-white/50 text-[#E17726] hover:bg-[#E17726] hover:text-white shadow-lg hover-lift"
                disabled={currentSlide === Math.ceil(specialties.length / 2) - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center space-x-1.5 mt-6">
            {Array.from({ length: Math.ceil(specialties.length / 2) }, (_, index) => (
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

export default SpecialtiesShowcase;
