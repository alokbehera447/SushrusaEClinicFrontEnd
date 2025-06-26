
import React from 'react';
import { Award, Users, Clock, Heart } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Award,
      title: "Certified Excellence",
      description: "ISO certified platform with industry-leading healthcare standards",
      color: "earth-green"
    },
    {
      icon: Users,
      title: "Expert Medical Team",
      description: "Board-certified physicians and healthcare specialists",
      color: "aqua"
    },
    {
      icon: Clock,
      title: "Always Available",
      description: "Round-the-clock support and emergency consultations",
      color: "earth-green"
    },
    {
      icon: Heart,
      title: "Patient-First Care",
      description: "Personalized healthcare experiences tailored to you",
      color: "aqua"
    }
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center space-x-3 bg-aqua/10 px-6 py-3 rounded-full border border-aqua/20">
            <div className="w-2 h-2 bg-aqua rounded-full"></div>
            <span className="text-sm font-semibold text-aqua tracking-wide">ABOUT SUSHRUSA</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-midnight leading-tight">
            Leading Healthcare
            <span className="text-aqua block">Innovation</span>
          </h2>
          
          <p className="text-xl text-midnight/70 max-w-4xl mx-auto leading-relaxed">
            SUSHRUSA is a pioneering healthcare and research center committed to transforming 
            healthcare delivery through innovative digital solutions. Our eClinic platform bridges 
            traditional medicine with cutting-edge technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className={`w-24 h-24 ${feature.color === 'earth-green' ? 'bg-earth-green/10' : 'bg-aqua/10'} rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 group-hover:shadow-modern`}>
                <feature.icon className={`w-12 h-12 ${feature.color === 'earth-green' ? 'text-earth-green' : 'text-aqua'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-midnight group-hover:text-earth-green transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-midnight/70 leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
