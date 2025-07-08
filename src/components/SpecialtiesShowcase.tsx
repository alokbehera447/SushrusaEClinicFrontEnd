import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Brain, 
  Eye, 
  Bone, 
  Baby, 
  Stethoscope,
  Activity,
  Pill
} from 'lucide-react';

const SpecialtiesShowcase = () => {
  const specialties = [
    {
      icon: Heart,
      title: "Cardiology",
      description: "Expert heart care and cardiovascular health",
      patients: "2,500+ patients treated",
      image: "Heart specialist consultation"
    },
    {
      icon: Brain,
      title: "Neurology",
      description: "Advanced neurological care and treatment",
      patients: "1,800+ patients treated",
      image: "Neurological examination"
    },
    {
      icon: Eye,
      title: "Ophthalmology",
      description: "Comprehensive eye care and vision health",
      patients: "3,200+ patients treated",
      image: "Eye examination"
    },
    {
      icon: Bone,
      title: "Orthopedics",
      description: "Bone, joint, and muscle health expertise",
      patients: "2,100+ patients treated",
      image: "Orthopedic consultation"
    },
    {
      icon: Baby,
      title: "Pediatrics",
      description: "Specialized care for children and infants",
      patients: "4,000+ patients treated",
      image: "Pediatric care"
    },
    {
      icon: Stethoscope,
      title: "General Medicine",
      description: "Primary care and general health management",
      patients: "5,500+ patients treated",
      image: "General consultation"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-sand-warm/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-20 space-y-4 md:space-y-6">
          <div className="inline-flex items-center space-x-3 bg-[#E17726]/10 px-6 py-3 rounded-full border border-[#E17726]/20">
            <div className="w-2 h-2 bg-[#E17726] rounded-full"></div>
            <span className="text-sm font-semibold text-[#E17726] tracking-wide">MEDICAL SPECIALTIES</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-midnight leading-tight">
            Expert care across
            <span className="text-[#E17726] block">all specialties</span>
          </h2>
          
          <p className="text-base md:text-xl md:md:text-2xl text-midnight/70 max-w-4xl mx-auto leading-relaxed mt-2 md:mt-0">
            Our board-certified specialists provide world-class care across multiple medical disciplines, 
            ensuring you receive the right treatment from the right expert.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialties.map((specialty, index) => (
            <Card key={index} className="group hover:shadow-modern transition-all duration-500 hover:-translate-y-3 border-0 shadow-soft bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                {/* Image Section */}
                <div className="aspect-[4/3] bg-gradient-to-br from-[#E17726]/5 to-aqua/5 relative overflow-hidden">
                  <img 
                    src="/placeholder.svg" 
                    alt={specialty.image}
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
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-midnight mb-3 group-hover:text-[#E17726] transition-colors duration-300">
                    {specialty.title}
                  </h3>
                  <p className="text-midnight/70 leading-relaxed text-lg">
                    {specialty.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesShowcase;
