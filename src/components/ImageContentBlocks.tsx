
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Users, Award, Clock } from 'lucide-react';

const ImageContentBlocks = () => {
  const contentBlocks = [
    {
      id: 1,
      title: "Healing starts here",
      subtitle: "The right answers the first time",
      description: "Effective treatment depends on getting the right diagnosis. Our experts diagnose and treat the toughest medical challenges.",
      buttonText: "Why choose SUSHRUSA",
      imagePlaceholder: "Healthcare professional with patient",
      reversed: false
    },
    {
      id: 2,
      title: "World-class care for global patients",
      subtitle: "Excellence in every consultation",
      description: "We make it easy for patients around the world to get care from SUSHRUSA eClinic. Experience premium healthcare from anywhere.",
      buttonText: "International services",
      imagePlaceholder: "Global healthcare connectivity",
      reversed: true
    },
    {
      id: 3,
      title: "Advanced medical technology",
      subtitle: "Innovation meets compassion",
      description: "Our state-of-the-art digital platform combines cutting-edge technology with personalized care to deliver exceptional healthcare experiences.",
      buttonText: "Explore our technology",
      imagePlaceholder: "Medical technology and innovation",
      reversed: false
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {contentBlocks.map((block, index) => (
          <div key={block.id} className={`grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-32 ${index === contentBlocks.length - 1 ? 'mb-0' : ''}`}>
            {/* Content */}
            <div className={`space-y-8 ${block.reversed ? 'lg:order-2' : ''}`}>
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-midnight leading-tight">
                  {block.title}
                </h2>
                
                <div className="space-y-4">
                  <h3 className="text-xl md:text-2xl font-semibold text-earth-green">
                    {block.subtitle}
                  </h3>
                  
                  <p className="text-lg md:text-xl text-midnight/70 leading-relaxed max-w-2xl">
                    {block.description}
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-aqua text-aqua hover:bg-aqua hover:text-white px-8 py-4 rounded-xl font-semibold text-lg h-auto group"
              >
                {block.buttonText}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>

              {/* Additional stats for first block */}
              {block.id === 1 && (
                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-earth-green" />
                      <span className="text-2xl font-bold text-midnight">500+</span>
                    </div>
                    <p className="text-midnight/60">Verified Doctors</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-aqua" />
                      <span className="text-2xl font-bold text-midnight">10k+</span>
                    </div>
                    <p className="text-midnight/60">Happy Patients</p>
                  </div>
                </div>
              )}
            </div>

            {/* Image */}
            <div className={`relative ${block.reversed ? 'lg:order-1' : ''}`}>
              <div className="aspect-[4/3] bg-gradient-to-br from-sand-warm to-earth-green/10 rounded-3xl overflow-hidden shadow-modern relative group">
                <img 
                  src="/placeholder.svg" 
                  alt={block.imagePlaceholder}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/20 to-transparent"></div>
                
                {/* Floating badge */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-soft">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-earth-green rounded-full"></div>
                    <span className="text-sm font-semibold text-midnight">SUSHRUSA eClinic</span>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-aqua/10 rounded-3xl"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-earth-green/10 rounded-2xl"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageContentBlocks;
