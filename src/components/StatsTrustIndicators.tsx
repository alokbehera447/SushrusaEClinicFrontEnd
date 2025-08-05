import React from 'react';
import { Users, HeartPulse, ShieldCheck, Star, Sparkles, Award } from 'lucide-react';

const stats = [
  { 
    icon: <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />, 
    label: 'Happy Patients', 
    value: '10,000+',
    gradient: 'from-[#E17726] to-[#FF8A56]'
  },
  { 
    icon: <HeartPulse className="w-8 h-8 sm:w-10 sm:h-10 text-white" />, 
    label: 'Expert Doctors', 
    value: '500+',
    gradient: 'from-cyan-500 to-blue-500'
  },
  { 
    icon: <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white" />, 
    label: 'Satisfaction Rate', 
    value: '98%',
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    icon: <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />, 
    label: 'Years Excellence', 
    value: '7+',
    gradient: 'from-green-500 to-emerald-500'
  },
];

const badges = [
  { icon: <ShieldCheck className="w-5 h-5 text-[#E17726]" />, text: 'HIPAA Compliant', bgColor: 'from-[#E17726]/5 to-[#E17726]/10' },
  { icon: <HeartPulse className="w-5 h-5 text-cyan-600" />, text: 'Board Certified', bgColor: 'from-cyan-400/5 to-cyan-400/10' },
  { icon: <Star className="w-5 h-5 text-yellow-500" />, text: '5-Star Rated', bgColor: 'from-yellow-400/5 to-yellow-400/10' },
];

const StatsTrustIndicators = () => (
  <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
    {/* Background Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl"></div>
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full border border-[#E17726]/20 mb-6">
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-[#E17726] to-[#FF8A56] rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
          </div>
          <Sparkles className="w-5 h-5 text-[#E17726]" />
          <span className="text-sm font-bold text-[#E17726] tracking-wide">TRUSTED BY THOUSANDS</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-midnight leading-tight">
          Numbers That 
          <span className="block text-[#E17726]">Speak For Themselves</span>
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        {stats.map((stat, idx) => (
          <div key={idx} className="group relative">
            <div className="bg-white rounded-3xl shadow-modern p-6 sm:p-8 text-center hover:shadow-xl-colored transition-all duration-500 hover:-translate-y-2">
              {/* Icon with gradient background */}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {stat.icon}
              </div>
              
              {/* Value */}
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-midnight mb-2 group-hover:text-[#E17726] transition-colors duration-300">
                {stat.value}
              </div>
              
              {/* Label */}
              <div className="text-gray-600 font-medium text-sm sm:text-base">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {badges.map((badge, idx) => (
          <div key={idx} className={`flex items-center bg-gradient-to-r ${badge.bgColor} backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 shadow-soft hover:shadow-modern transition-all duration-300 hover:scale-105`}>
            {badge.icon}
            <span className="ml-3 font-semibold text-midnight text-sm sm:text-base">{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsTrustIndicators;