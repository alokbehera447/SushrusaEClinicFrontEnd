import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Heart, Shield, Award, Clock, Users, Star, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface WhyChooseSushrusaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhyChooseSushrusaModal: React.FC<WhyChooseSushrusaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const benefits = [
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: 'Expert Medical Care',
      description: 'Our board-certified doctors provide top-quality healthcare with years of experience in their specialties.',
      gradient: 'from-[#E17726] to-[#FF8A56]',
      stats: '500+ Verified Doctors'
    },
    {
      icon: <Clock className="w-8 h-8 text-white" />,
      title: '24/7 Availability',
      description: 'Access healthcare anytime, anywhere. Our platform is available round-the-clock for your medical needs.',
      gradient: 'from-blue-500 to-cyan-500',
      stats: '15min Average Response'
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: 'Secure & Private',
      description: 'Your health data is protected with military-grade encryption and HIPAA-compliant security measures.',
      gradient: 'from-green-500 to-emerald-500',
      stats: 'HIPAA Compliant'
    },
    {
      icon: <Award className="w-8 h-8 text-white" />,
      title: 'Affordable Healthcare',
      description: 'Quality healthcare at transparent, affordable prices. No hidden fees or surprise charges.',
      gradient: 'from-purple-500 to-pink-500',
      stats: 'Starting ₹500'
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: 'Personalized Care',
      description: 'Tailored treatment plans based on your individual health needs and medical history.',
      gradient: 'from-orange-500 to-red-500',
      stats: '98% Satisfaction Rate'
    },
    {
      icon: <Star className="w-8 h-8 text-white" />,
      title: 'Top-Rated Platform',
      description: 'Trusted by thousands of patients with consistently high ratings and positive reviews.',
      gradient: 'from-yellow-500 to-orange-500',
      stats: '4.9/5 Average Rating'
    }
  ];

  const achievements = [
    { number: '10,000+', label: 'Happy Patients', icon: <Users className="w-6 h-6 text-[#E17726]" /> },
    { number: '500+', label: 'Expert Doctors', icon: <Heart className="w-6 h-6 text-[#E17726]" /> },
    { number: '50+', label: 'Cities Covered', icon: <Award className="w-6 h-6 text-[#E17726]" /> },
    { number: '7+', label: 'Years of Excellence', icon: <Star className="w-6 h-6 text-[#E17726]" /> }
  ];

  const differentiators = [
    {
      title: 'Advanced Technology',
      description: 'AI-powered diagnosis assistance and cutting-edge telemedicine infrastructure',
      icon: '🔬'
    },
    {
      title: 'Comprehensive Care',
      description: 'From consultation to prescription delivery, we handle your complete healthcare journey',
      icon: '🏥'
    },
    {
      title: 'Quality Assurance',
      description: 'Rigorous doctor verification process and continuous quality monitoring',
      icon: '✅'
    },
    {
      title: 'Patient-First Approach',
      description: 'Every decision is made with patient comfort, safety, and satisfaction in mind',
      icon: '❤️'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10 p-8 pb-6">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full border border-[#E17726]/20 mb-6">
              <Sparkles className="w-5 h-5 text-[#E17726]" />
              <span className="text-sm font-bold text-[#E17726] tracking-wide">WHY CHOOSE US</span>
              <Heart className="w-5 h-5 text-cyan-600" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-midnight mb-4">
              Why Choose 
              <span className="block text-[#E17726]">SUSHRUSA?</span>
            </h2>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience healthcare like never before with our patient-centric approach, 
              cutting-edge technology, and expert medical professionals.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Achievements Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  {achievement.icon}
                </div>
                <div className="text-3xl font-black text-midnight mb-1">{achievement.number}</div>
                <div className="text-gray-600 font-medium text-sm">{achievement.label}</div>
              </div>
            ))}
          </div>

          {/* Main Benefits */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-midnight text-center mb-8">What Makes Us Different</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl shadow-modern p-6 hover:shadow-xl-colored transition-all duration-500 hover:-translate-y-2 border border-gray-100/50 h-full">
                    <div className={`w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {benefit.icon}
                    </div>
                    
                    <h4 className="text-xl font-bold text-midnight mb-3 group-hover:text-[#E17726] transition-colors duration-300">
                      {benefit.title}
                    </h4>
                    
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {benefit.description}
                    </p>
                    
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#E17726]/10 to-[#E17726]/5 text-[#E17726] text-sm font-semibold">
                      {benefit.stats}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Differentiators */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-midnight text-center mb-8">Our Unique Advantages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {differentiators.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-gradient-to-r from-white to-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h4 className="text-lg font-bold text-midnight mb-2">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Assurance */}
          <div className="bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 rounded-3xl p-8 mb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-midnight mb-6">Our Quality Promise</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="font-bold text-midnight mb-2">Verified Doctors</h4>
                  <p className="text-gray-600 text-sm">All doctors are board-certified and background verified</p>
                </div>
                <div className="text-center">
                  <Shield className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-bold text-midnight mb-2">Secure Platform</h4>
                  <p className="text-gray-600 text-sm">HIPAA-compliant security with end-to-end encryption</p>
                </div>
                <div className="text-center">
                  <Award className="w-12 h-12 text-[#E17726] mx-auto mb-3" />
                  <h4 className="font-bold text-midnight mb-2">Quality Care</h4>
                  <p className="text-gray-600 text-sm">Continuous monitoring and quality assurance programs</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-midnight mb-4">Ready to Experience Better Healthcare?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied patients who trust SUSHRUSA for their healthcare needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:shadow-xl-colored text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105">
                Book Consultation Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-white border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500"
              >
                Learn More About Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseSushrusaModal;