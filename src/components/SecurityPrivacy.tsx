import React from 'react';
import { Lock, ShieldCheck, FileText, Sparkles, Award, Eye } from 'lucide-react';

const securityFeatures = [
  {
    icon: <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
    title: 'End-to-End Encryption',
    description: 'Your health data is protected with military-grade encryption.',
    details: 'All consultations and medical records are encrypted with AES-256 encryption.',
    gradient: 'from-[#E17726] to-[#FF8A56]',
    bgColor: 'from-[#E17726]/5 to-[#E17726]/10'
  },
  {
    icon: <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
    title: 'HIPAA Compliant',
    description: 'We follow strict healthcare data privacy and security standards.',
    details: 'Certified compliance with all healthcare data protection regulations.',
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-400/5 to-green-400/10'
  },
  {
    icon: <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-white" />,
    title: 'Privacy First',
    description: 'Your personal information is never shared without explicit consent.',
    details: 'Complete control over your data sharing and privacy settings.',
    gradient: 'from-cyan-500 to-blue-500',
    bgColor: 'from-cyan-400/5 to-cyan-400/10'
  },
];

const certifications = [
  { name: 'ISO 27001', desc: 'Information Security' },
  { name: 'SOC 2 Type II', desc: 'Security & Availability' },
  { name: 'HIPAA', desc: 'Healthcare Privacy' },
  { name: 'GDPR', desc: 'Data Protection' },
];

const SecurityPrivacy = () => (
  <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
    {/* Background Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl"></div>
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
          <span className="text-sm font-bold text-[#E17726] tracking-wide">SECURITY & PRIVACY</span>
          <ShieldCheck className="w-5 h-5 text-green-600" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-midnight leading-tight">
          Your Data is
          <span className="block text-[#E17726]">Safe & Secure</span>
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-4">
          We take your privacy seriously. Our platform is built with 
          <span className="text-[#E17726] font-semibold"> enterprise-grade security</span> to protect your sensitive health information.
        </p>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="group relative">
            <div className="bg-white rounded-3xl shadow-modern p-6 sm:p-8 text-center hover:shadow-xl-colored transition-all duration-500 hover:-translate-y-3 border border-gray-100/50">
              {/* Icon with gradient background */}
              <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-bold text-midnight mb-4 group-hover:text-[#E17726] transition-colors duration-300">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>
              
              {/* Details */}
              <div className={`glass bg-gradient-to-r ${feature.bgColor} rounded-2xl p-4`}>
                <p className="text-sm text-gray-700 font-medium">
                  {feature.details}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-midnight mb-8">
          Certified & Compliant
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {certifications.map((cert, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-2xl shadow-soft p-6 text-center hover:shadow-modern transition-all duration-300 hover:-translate-y-1 border border-gray-100/50">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-[#E17726]" />
                </div>
                <div className="font-bold text-midnight mb-1">{cert.name}</div>
                <div className="text-gray-600 text-sm">{cert.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default SecurityPrivacy;