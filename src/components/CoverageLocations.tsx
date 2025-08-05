import React from 'react';
import { MapPin, Globe2, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const locations = [
  { city: 'Delhi NCR', patients: '2,500+', icon: '🏛️' },
  { city: 'Mumbai', patients: '1,800+', icon: '🏙️' },
  { city: 'Bangalore', patients: '1,600+', icon: '💻' },
  { city: 'Hyderabad', patients: '1,200+', icon: '🌆' },
  { city: 'Chennai', patients: '1,100+', icon: '🏭' },
  { city: 'Kolkata', patients: '900+', icon: '🎭' },
  { city: 'Pune', patients: '800+', icon: '🎓' },
  { city: 'Ahmedabad', patients: '700+', icon: '🏪' },
];

const coverageStats = [
  { number: '50+', label: 'Cities Covered', icon: <MapPin className="w-6 h-6 text-white" /> },
  { number: '24/7', label: 'Service Available', icon: <Clock className="w-6 h-6 text-white" /> },
  { number: '15min', label: 'Avg Response Time', icon: <CheckCircle className="w-6 h-6 text-white" /> },
];

const CoverageLocations = () => (
  <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-sand-warm/20 relative overflow-hidden">
    {/* Background Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl"></div>
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full border border-[#E17726]/20 mb-6">
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-[#E17726] to-[#FF8A56] rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
          </div>
          <Sparkles className="w-5 h-5 text-[#E17726]" />
          <span className="text-sm font-bold text-[#E17726] tracking-wide">NATIONWIDE COVERAGE</span>
          <Globe2 className="w-5 h-5 text-cyan-600" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-midnight leading-tight">
          Available Across
          <span className="block text-[#E17726]">India</span>
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-4">
          Get expert healthcare consultation from anywhere in India. 
          <span className="text-[#E17726] font-semibold"> 24/7 availability</span> with doctors in your local language.
        </p>
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {coverageStats.map((stat, index) => (
          <div key={index} className="group">
            <div className="bg-white rounded-3xl shadow-modern p-4 sm:p-6 text-center hover:shadow-xl-colored transition-all duration-500 hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#E17726] to-[#FF8A56] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                {stat.icon}
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-midnight mb-1 sm:mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* City Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {locations.map((location, index) => (
          <div key={index} className="group">
            <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6 text-center hover:shadow-modern transition-all duration-300 hover:-translate-y-1 border border-gray-100/50">
              <div className="text-2xl sm:text-3xl mb-2">{location.icon}</div>
              <h3 className="font-bold text-midnight mb-1 text-sm sm:text-base">{location.city}</h3>
              <div className="text-[#E17726] font-semibold text-xs sm:text-sm">{location.patients} patients</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 rounded-3xl p-6 sm:p-8 lg:p-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-midnight mb-4">
            Don't see your city?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're expanding rapidly! Join our waitlist to be notified when SUSHRUSA becomes available in your area.
          </p>
          <Button className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:shadow-xl-colored text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-500 hover:scale-105 hover:-translate-y-1">
            <MapPin className="w-5 h-5 mr-2" />
            Join Waitlist
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default CoverageLocations;