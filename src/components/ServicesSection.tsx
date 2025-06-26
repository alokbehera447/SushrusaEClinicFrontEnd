import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      description: "Quick and secure patient onboarding with digital health profiles",
      color: "medical-blue"
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Easy scheduling with real-time availability and automated reminders",
      color: "medical-green"
    },
    {
      icon: Video,
      title: "Video Consultations",
      description: "High-quality video calls with healthcare professionals",
      color: "medical-blue"
    },
    {
      icon: FileText,
      title: "ePrescription",
      description: "Digital prescriptions with direct pharmacy integration",
      color: "medical-green"
    },
    {
      icon: Database,
      title: "Medical Records",
      description: "Secure storage and access to complete health history",
      color: "medical-blue"
    },
    {
      icon: Pill,
      title: "Pharmacy Fulfillment",
      description: "Seamless prescription fulfillment and medication delivery",
      color: "medical-green"
    },
    {
      icon: Settings,
      title: "Admin Dashboard",
      description: "Comprehensive management tools for healthcare providers",
      color: "medical-blue"
    }
  ];

  return (
    <section id="services" className="py-20 bg-medical-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Core Services
          </h2>
          <p className="text-lg text-medical-gray max-w-2xl mx-auto">
            Comprehensive digital healthcare solutions designed to streamline 
            your medical experience and improve health outcomes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  service.color === 'medical-blue' ? 'bg-medical-blue/10' : 'bg-medical-green/10'
                } group-hover:${service.color === 'medical-blue' ? 'bg-medical-blue/20' : 'bg-medical-green/20'} transition-colors`}>
                  <service.icon className={`w-8 h-8 ${
                    service.color === 'medical-blue' ? 'text-medical-blue' : 'text-medical-green'
                  }`} />
                </div>
                <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-medical-gray">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
