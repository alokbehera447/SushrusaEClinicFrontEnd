import React from 'react';
import { Award, Sparkles, Building, CheckCircle } from 'lucide-react';

const partnerships = [
  { name: 'Apollo Hospitals', logo: '/logo.jpeg', type: 'Hospital Partner' },
  { name: 'Fortis Healthcare', logo: '/sushrusa_logo_1.png', type: 'Healthcare Network' },
  { name: 'Max Healthcare', logo: '/sushrusa_logo_2.png', type: 'Medical Partner' },
  { name: 'Manipal Hospitals', logo: '/sushrusa_logo_1-Photoroom.png', type: 'Clinical Partner' },
];

const certifications = [
  { name: 'NABH Accredited', description: 'National Accreditation Board for Hospitals' },
  { name: 'ISO 9001:2015', description: 'Quality Management Systems' },
  { name: 'HIPAA Compliant', description: 'Healthcare Data Protection' },
  { name: 'JCI Certified', description: 'Joint Commission International' },
];

const PartnershipsCertifications = () => (
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
          <span className="text-sm font-bold text-[#E17726] tracking-wide">TRUSTED PARTNERSHIPS</span>
          <Award className="w-5 h-5 text-cyan-600" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-midnight leading-tight">
          Trusted by Leading
          <span className="block text-[#E17726]">Healthcare Partners</span>
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-4">
          We collaborate with top hospitals and healthcare institutions. 
          <span className="text-[#E17726] font-semibold"> Certified excellence</span> in every aspect of our service.
        </p>
      </div>

      {/* Hospital Partners */}
      <div className="mb-8 sm:mb-12 lg:mb-16">
        <h3 className="text-2xl sm:text-3xl font-bold text-midnight mb-8 text-center flex items-center justify-center">
          <Building className="w-6 h-6 mr-3 text-[#E17726]" />
          Hospital Partners
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {partnerships.map((partner, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-3xl shadow-modern p-6 sm:p-8 text-center hover:shadow-xl-colored transition-all duration-500 hover:-translate-y-2 border border-gray-100/50">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 bg-gray-50 flex items-center justify-center">
                  <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
                </div>
                
                <h4 className="font-bold text-midnight mb-1 text-sm sm:text-base group-hover:text-[#E17726] transition-colors duration-300">
                  {partner.name}
                </h4>
                <div className="text-gray-600 text-xs sm:text-sm">
                  {partner.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-midnight mb-8 text-center flex items-center justify-center">
          <Award className="w-6 h-6 mr-3 text-[#E17726]" />
          Certifications & Accreditations
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {certifications.map((cert, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-3xl shadow-modern p-6 text-center hover:shadow-xl-colored transition-all duration-500 hover:-translate-y-2 border border-gray-100/50">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-[#E17726]" />
                </div>
                
                <h4 className="font-bold text-midnight mb-2 group-hover:text-[#E17726] transition-colors duration-300">
                  {cert.name}
                </h4>
                <p className="text-gray-600 text-sm">
                  {cert.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default PartnershipsCertifications;