import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Users, MapPin, Video, FileText, Phone, Clock, CheckCircle, Star, Award, Sparkles, Stethoscope, Target, Shield } from 'lucide-react';

interface EClinicPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const EClinicPage: React.FC<EClinicPageProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const services = [
    {
      title: "General Healthcare Consultations",
      description: "Wide range of general healthcare services, including routine check-ups, preventive care, and treatment of acute and chronic conditions.",
      icon: <Stethoscope className="w-8 h-8 text-white" />,
      gradient: "from-[#E17726] to-[#FF8A56]"
    },
    {
      title: "Specialized Medical Treatments", 
      description: "Advanced care in various medical fields such as cardiology, neurology, orthopedics, and more from our team of specialists.",
      icon: <Heart className="w-8 h-8 text-white" />,
      gradient: "from-red-500 to-pink-500"
    },
    {
      title: "Diagnostic Services",
      description: "State-of-the-art diagnostic services, including laboratory tests, imaging, and screenings for accurate diagnosis.",
      icon: <Target className="w-8 h-8 text-white" />,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Research-Based Healthcare Solutions",
      description: "At the forefront of medical research, developing innovative treatments and healthcare solutions.",
      icon: <Award className="w-8 h-8 text-white" />,
      gradient: "from-purple-500 to-indigo-500"
    }
  ];

  const eClinicProcess = [
    {
      step: 1,
      title: "Online Consultations",
      description: "Patients can schedule and attend consultations with our healthcare professionals via video calls. This ensures timely medical advice without the need to travel long distances.",
      icon: <Video className="w-6 h-6 text-[#E17726]" />
    },
    {
      step: 2,
      title: "Health Education",
      description: "Our E-Clinic platform offers educational resources to help patients understand their conditions, manage their health, and make informed decisions about their care.",
      icon: <FileText className="w-6 h-6 text-[#E17726]" />
    },
    {
      step: 3,
      title: "Prescription Services",
      description: "After a consultation, prescriptions can be sent directly to local pharmacies, ensuring that patients have easy access to necessary medications.",
      icon: <Phone className="w-6 h-6 text-[#E17726]" />
    },
    {
      step: 4,
      title: "Follow-Up Care",
      description: "We provide continuous follow-up care to monitor patient progress and make adjustments to treatment plans as needed.",
      icon: <Clock className="w-6 h-6 text-[#E17726]" />
    }
  ];

  const benefits = [
    {
      title: "Accessibility",
      description: "Patients in rural areas can access healthcare services without the burden of travel, reducing the time and cost associated with seeking medical care.",
      icon: "🌍"
    },
    {
      title: "Quality Care",
      description: "Our team of experienced healthcare professionals delivers the same standard of care through our E-Clinic as they do in our physical center.",
      icon: "⭐"
    },
    {
      title: "Convenience",
      description: "Flexible scheduling options make it easier for patients to receive care at a time that suits them best.",
      icon: "⏰"
    },
    {
      title: "Comprehensive Support",
      description: "In addition to medical consultations, our E-Clinic offers support services such as mental health counseling, nutritional advice, and chronic disease management.",
      icon: "🛡️"
    }
  ];

  const stats = [
    { number: "50+", label: "Rural Communities Served", icon: <MapPin className="w-6 h-6 text-[#E17726]" /> },
    { number: "10,000+", label: "E-Clinic Consultations", icon: <Video className="w-6 h-6 text-[#E17726]" /> },
    { number: "500+", label: "Healthcare Professionals", icon: <Users className="w-6 h-6 text-[#E17726]" /> },
    { number: "24/7", label: "Emergency Support", icon: <Shield className="w-6 h-6 text-[#E17726]" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowRight className="w-6 h-6 text-gray-600 rotate-180" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-midnight">Sushrusa Healthcare & Research Center</h1>
                <p className="text-gray-600">E-Clinic: Accessible Healthcare for Rural Communities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full border border-[#E17726]/20 mb-6">
              <Sparkles className="w-5 h-5 text-[#E17726]" />
              <span className="text-sm font-bold text-[#E17726] tracking-wide">BRIDGING HEALTHCARE GAPS</span>
              <Heart className="w-5 h-5 text-cyan-600" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-midnight leading-tight mb-6">
              Healthcare Excellence
              <span className="block text-[#E17726]">For Every Community</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Sushrusa Healthcare & Research Center is dedicated to providing high-quality, comprehensive 
              healthcare services to individuals and communities. Our mission is to deliver exceptional medical 
              care, advance health through innovative research, and improve patient outcomes through education 
              and community outreach.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black text-midnight mb-1">{stat.number}</div>
                  <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Our Services */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-midnight mb-4">Our Services</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare solutions designed to meet the diverse needs of our patients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-3xl shadow-modern p-8 hover:shadow-xl-colored transition-all duration-500 hover:-translate-y-2 border border-gray-100/50 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {service.icon}
                  </div>
                  
                  <h4 className="text-xl font-bold text-midnight mb-4 group-hover:text-[#E17726] transition-colors duration-300">
                    {service.title}
                  </h4>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* E-Clinic Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-midnight mb-4">
              E-Clinic: <span className="text-[#E17726]">Accessible Healthcare for Rural Communities</span>
            </h3>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Our E-Clinic is a pioneering initiative aimed at bridging the healthcare gap for rural communities. 
              Our platform leverages technology to provide high-quality medical consultations and treatments 
              to individuals in remote and underserved areas.
            </p>
          </div>

          {/* How E-Clinic Works */}
          <div className="mb-16">
            <h4 className="text-2xl font-bold text-midnight text-center mb-8">How the E-Clinic Works</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eClinicProcess.map((process, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#E17726] to-[#FF8A56] rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-2xl font-black text-white">{process.step}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                      {process.icon}
                    </div>
                  </div>
                  
                  <h5 className="text-lg font-bold text-midnight mb-3">{process.title}</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">{process.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 rounded-3xl p-8 sm:p-12">
            <h4 className="text-2xl font-bold text-midnight text-center mb-8">Benefits of the E-Clinic</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="text-3xl">{benefit.icon}</div>
                  <div>
                    <h5 className="text-lg font-bold text-midnight mb-2">{benefit.title}</h5>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Commitment */}
        <div className="text-center mb-12">
          <h3 className="text-3xl sm:text-4xl font-bold text-midnight mb-6">Our Commitment</h3>
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100">
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto mb-8">
              At Sushrusa Healthcare & Research Center, we are committed to improving health outcomes for all 
              individuals, regardless of their location. Through our E-Clinic, we strive to make healthcare more 
              accessible, affordable, and effective for rural communities, ensuring that everyone has the 
              opportunity to live a healthier life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:shadow-xl-colored text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105">
                <Video className="w-5 h-5 mr-3" />
                Start E-Clinic Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-white border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500"
              >
                <Phone className="w-5 h-5 mr-3" />
                Contact Our Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EClinicPage;