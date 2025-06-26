
import React from 'react';
import { Award, Users, Clock, Heart } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About SUSHRUSA
          </h2>
          <p className="text-lg text-medical-gray max-w-3xl mx-auto">
            SUSHRUSA is a leading healthcare and research center committed to providing 
            innovative digital health solutions. Our eClinic platform bridges the gap 
            between traditional healthcare and modern technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="bg-medical-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-medical-blue/20 transition-colors">
              <Award className="w-8 h-8 text-medical-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Certified Excellence</h3>
            <p className="text-medical-gray">ISO certified healthcare platform with industry-leading standards</p>
          </div>

          <div className="text-center group">
            <div className="bg-medical-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-medical-green/20 transition-colors">
              <Users className="w-8 h-8 text-medical-green" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
            <p className="text-medical-gray">Qualified healthcare professionals and tech specialists</p>
          </div>

          <div className="text-center group">
            <div className="bg-medical-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-medical-blue/20 transition-colors">
              <Clock className="w-8 h-8 text-medical-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
            <p className="text-medical-gray">Round-the-clock support and emergency consultations</p>
          </div>

          <div className="text-center group">
            <div className="bg-medical-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-medical-green/20 transition-colors">
              <Heart className="w-8 h-8 text-medical-green" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Patient-Centered</h3>
            <p className="text-medical-gray">Focused on delivering personalized healthcare experiences</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
