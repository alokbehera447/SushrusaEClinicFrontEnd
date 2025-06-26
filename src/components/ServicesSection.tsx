
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Calendar, 
  Video, 
  FileText, 
  Database, 
  Pill, 
  Settings 
} from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: User,
      title: "Patient Registration",
      description: "Quick and secure digital onboarding with comprehensive health profiles"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered appointment booking with real-time availability"
    },
    {
      icon: Video,
      title: "Video Consultations",
      description: "HD video calls with certified healthcare professionals"
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Instant e-prescriptions with direct pharmacy integration"
    },
    {
      icon: Database,
      title: "Health Records",
      description: "Secure cloud storage for complete medical history"
    },
    {
      icon: Pill,
      title: "Pharmacy Network",
      description: "Seamless medication delivery and prescription fulfillment"
    }
  ];

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-white to-sand-warm/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center space-x-3 bg-earth-green/10 px-6 py-3 rounded-full border border-earth-green/20">
            <div className="w-2 h-2 bg-earth-green rounded-full"></div>
            <span className="text-sm font-semibold text-earth-green tracking-wide">COMPREHENSIVE SERVICES</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-midnight leading-tight">
            Everything You Need for
            <span className="text-earth-green block">Modern Healthcare</span>
          </h2>
          
          <p className="text-xl text-midnight/70 max-w-3xl mx-auto leading-relaxed">
            Our integrated platform combines cutting-edge technology with personalized care 
            to deliver exceptional healthcare experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-modern transition-all duration-500 hover:-translate-y-3 border-0 shadow-soft bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-6 pt-10">
                <div className="w-20 h-20 bg-gradient-to-br from-earth-green/10 to-aqua/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-10 h-10 text-earth-green" />
                </div>
                <CardTitle className="text-2xl font-bold text-midnight group-hover:text-earth-green transition-colors duration-300">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-8 pb-10">
                <p className="text-midnight/70 leading-relaxed text-lg">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
