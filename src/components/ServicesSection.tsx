
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
      color: "earth-green"
    },
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Easy scheduling with real-time availability and automated reminders",
      color: "aqua"
    },
    {
      icon: Video,
      title: "Video Consultations",
      description: "High-quality video calls with healthcare professionals",
      color: "earth-green"
    },
    {
      icon: FileText,
      title: "ePrescription",
      description: "Digital prescriptions with direct pharmacy integration",
      color: "orange-deep"
    },
    {
      icon: Database,
      title: "Medical Records",
      description: "Secure storage and access to complete health history",
      color: "aqua"
    },
    {
      icon: Pill,
      title: "Pharmacy Fulfillment",
      description: "Seamless prescription fulfillment and medication delivery",
      color: "earth-green"
    },
    {
      icon: Settings,
      title: "Admin Dashboard",
      description: "Comprehensive management tools for healthcare providers",
      color: "orange-deep"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'earth-green':
        return {
          bg: 'bg-earth-green/10',
          bgHover: 'group-hover:bg-earth-green/20',
          text: 'text-earth-green'
        };
      case 'aqua':
        return {
          bg: 'bg-aqua/10',
          bgHover: 'group-hover:bg-aqua/20',
          text: 'text-aqua'
        };
      case 'orange-deep':
        return {
          bg: 'bg-orange-deep/10',
          bgHover: 'group-hover:bg-orange-deep/20',
          text: 'text-orange-deep'
        };
      default:
        return {
          bg: 'bg-earth-green/10',
          bgHover: 'group-hover:bg-earth-green/20',
          text: 'text-earth-green'
        };
    }
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white to-sand-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-earth-green/10 px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-medium text-earth-green">Our Services</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-6">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Modern digital healthcare services designed to streamline 
            your medical experience and improve health outcomes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const colorClasses = getColorClasses(service.color);
            return (
              <Card key={index} className="group hover:shadow-modern transition-all duration-300 hover:-translate-y-2 border-0 shadow-soft bg-white rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colorClasses.bg} ${colorClasses.bgHover} transition-all duration-300`}>
                    <service.icon className={`w-8 h-8 ${colorClasses.text}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-midnight">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
