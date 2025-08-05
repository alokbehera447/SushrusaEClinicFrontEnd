import React, { useEffect, useRef, useState } from 'react';
import { Award, Users, Clock, Heart, Sparkles, Star } from 'lucide-react';

const AboutSection = () => {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([true, true, true, true]); // Initialize all cards as visible
  const [isHeaderVisible, setIsHeaderVisible] = useState(true); // Initialize header as visible
  const sectionRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Award,
      title: "Certified Excellence",
      description: "ISO certified platform with industry-leading healthcare standards",
      color: "orange-theme",
      gradient: "from-[#E17726] to-[#FF8A56]"
    },
    {
      icon: Users,
      title: "Expert Medical Team",
      description: "Board-certified physicians and healthcare specialists",
      color: "aqua",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: Clock,
      title: "Always Available",
      description: "Round-the-clock support and emergency consultations",
      color: "orange-theme",
      gradient: "from-[#E17726] to-[#FF8A56]"
    },
    {
      icon: Heart,
      title: "Patient-First Care",
      description: "Personalized healthcare experiences tailored to you",
      color: "aqua",
      gradient: "from-cyan-500 to-blue-500"
    }
  ];

  useEffect(() => {
    // For mobile, ensure everything is visible immediately
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // On mobile, show everything immediately
      setIsHeaderVisible(true);
      setVisibleCards([true, true, true, true]);
      return;
    }

    // Desktop intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('about-header')) {
              setIsHeaderVisible(true);
            } else {
              const cardIndex = parseInt(entry.target.getAttribute('data-card-index') || '0');
              setTimeout(() => {
                setVisibleCards(prev => {
                  const newVisible = [...prev];
                  newVisible[cardIndex] = true;
                  return newVisible;
                });
              }, cardIndex * 200);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    const cardElements = document.querySelectorAll('.feature-card');
    cardElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-8 sm:py-12 lg:py-8 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-4 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-48 h-48 sm:w-80 sm:h-80 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className={`about-header text-center mb-12 sm:mb-16 lg:mb-20 space-y-4 sm:space-y-6 ${isHeaderVisible ? 'animate-fade-in-up' : 'opacity-100'}`}
        >
          <div className="inline-flex items-center space-x-2 sm:space-x-3 glass px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-cyan-400/20 hover-glow group cursor-pointer">
            <div className="relative">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-blue rounded-full animate-pulse-glow"></div>
              <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-cyan-600 rounded-full animate-ping"></div>
            </div>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xs sm:text-sm lg:text-lg font-bold text-cyan-600 tracking-wide">ABOUT SUSHRUSA</span>
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#E17726] group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-midnight leading-tight">
              <span className="block">Leading Healthcare</span>
              <span className="block text-[#00B8D4]">
                Innovation
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              SUSHRUSA is a pioneering healthcare and research center committed to transforming 
              healthcare delivery through <span className="text-[#E17726] font-semibold">innovative digital solutions</span>. 
              Our eClinic platform bridges traditional medicine with cutting-edge technology.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              data-card-index={index}
              className={`feature-card text-center group ${
                visibleCards[index] 
                  ? 'animate-scale-in' 
                  : 'opacity-100'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                {/* Main Card */}
                <div className="glass p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl-colored hover-lift transition-all duration-500 group-hover:shadow-2xl">
                  {/* Icon Container */}
                  <div className="relative mb-6 sm:mb-8">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br ${feature.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    
                    {/* Floating sparkle */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-[#E17726] animate-pulse" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-midnight group-hover:text-[#E17726] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative element */}
                  <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center`}>
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Floating Background Element */}
                <div className={`absolute -inset-3 sm:-inset-4 bg-gradient-to-br ${feature.gradient} rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>

                {/* Index Number */}
                <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 glass w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-lg text-[#E17726] shadow-modern hover-scale cursor-pointer">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className={`text-center mt-12 sm:mt-16 lg:mt-20 ${isHeaderVisible ? 'animate-fade-in-up animation-delay-600' : 'opacity-100'}`}>
          <div className="glass p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-white/20 hover-lift max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-midnight mb-3 sm:mb-4">
              Experience Healthcare Excellence
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
              Join our mission to make quality healthcare accessible to everyone, everywhere
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <div className="glass px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-[#E17726]/20">
                <span className="text-sm sm:text-base text-[#E17726] font-bold">Trusted by 10,000+ patients</span>
              </div>
              <div className="glass px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-cyan-400/20">
                <span className="text-sm sm:text-base text-cyan-600 font-bold">500+ Expert doctors</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
