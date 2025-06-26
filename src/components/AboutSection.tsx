
import React from 'react';
import { Award, Users, Clock, Heart } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-aqua/10 px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-medium text-aqua">About Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-6">
            About SUSHRUSA
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            SUSHRUSA is a leading healthcare and research center committed to providing 
            innovative digital health solutions. Our eClinic platform bridges the gap 
            between traditional healthcare and modern technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="bg-earth-green/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-earth-green/20 transition-all duration-300 group-hover:scale-110">
              <Award className="w-10 h-10 text-earth-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-midnight">Certified Excellence</h3>
            <p className="text-gray-600 leading-relaxed">ISO certified healthcare platform with industry-leading standards</p>
          </div>

          <div className="text-center group">
            <div className="bg-aqua/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-aqua/20 transition-all duration-300 group-hover:scale-110">
              <Users className="w-10 h-10 text-aqua" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-midnight">Expert Team</h3>
            <p className="text-gray-600 leading-relaxed">Qualified healthcare professionals and tech specialists</p>
          </div>

          <div className="text-center group">
            <div className="bg-orange-deep/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-deep/20 transition-all duration-300 group-hover:scale-110">
              <Clock className="w-10 h-10 text-orange-deep" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-midnight">24/7 Availability</h3>
            <p className="text-gray-600 leading-relaxed">Round-the-clock support and emergency consultations</p>
          </div>

          <div className="text-center group">
            <div className="bg-earth-green/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-earth-green/20 transition-all duration-300 group-hover:scale-110">
              <Heart className="w-10 h-10 text-earth-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-midnight">Patient-Centered</h3>
            <p className="text-gray-600 leading-relaxed">Focused on delivering personalized healthcare experiences</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
