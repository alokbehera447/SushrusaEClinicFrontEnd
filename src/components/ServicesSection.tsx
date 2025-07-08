import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Calendar, 
  Video, 
  FileText, 
  Database, 
  Pill, 
  ArrowRight,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';

const ServicesSection = () => {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const services = [
    {
      icon: User,
      title: "Smart Registration",
      description: "AI-powered patient onboarding with instant verification and comprehensive health profiling",
      features: ["Instant Verification", "Health Risk Assessment", "Secure Data Storage"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50"
    },
    {
      icon: Calendar,
      title: "Intelligent Scheduling",
      description: "Machine learning-based appointment optimization with real-time availability and smart reminders",
      features: ["AI Optimization", "Smart Reminders", "Real-time Sync"],
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50"
    },
    {
      icon: Video,
      title: "HD Consultations",
      description: "Crystal-clear video calls with advanced diagnostics tools and real-time health monitoring",
      features: ["4K Video Quality", "Screen Sharing", "Recording Available"],
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50"
    },
    {
      icon: FileText,
      title: "Smart Prescriptions",
      description: "AI-assisted prescription writing with drug interaction checks and direct pharmacy integration",
      features: ["Drug Interaction Check", "Pharmacy Integration", "Digital Signatures"],
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50"
    },
    {
      icon: Database,
      title: "Unified Health Records",
      description: "Blockchain-secured medical records with instant access and complete history management",
      features: ["Blockchain Security", "Instant Access", "Complete History"],
      color: "from-indigo-500 to-blue-500",
      bgColor: "from-indigo-50 to-blue-50"
    },
    {
      icon: Pill,
      title: "Smart Pharmacy",
      description: "Automated medication management with delivery tracking and adherence monitoring",
      features: ["Automated Delivery", "Adherence Tracking", "Refill Reminders"],
      color: "from-teal-500 to-cyan-500",
      bgColor: "from-teal-50 to-cyan-50"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Staggered animation for cards
            services.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => {
                  const newVisible = [...prev];
                  newVisible[index] = true;
                  return newVisible;
                });
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="py-32 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20 space-y-8 fade-in-section is-visible">
          <div className="inline-flex items-center space-x-3 glass px-8 py-4 rounded-full border border-[#E17726]/20 hover-glow group cursor-pointer">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
              <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
            </div>
            <Sparkles className="w-5 h-5 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-lg font-bold text-[#E17726] tracking-wide">COMPREHENSIVE SERVICES</span>
            <Shield className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-midnight leading-tight">
              <span className="block">Everything You Need</span>
              <span className="block text-transparent bg-clip-text bg-gradient-orange animate-gradient">
                All in One Place
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Experience the future of healthcare with our <span className="text-[#E17726] font-semibold">AI-powered ecosystem</span>. 
              From instant consultations to smart prescriptions, we've revolutionized every aspect of your healthcare journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button className="bg-gradient-orange hover:shadow-xl-colored text-white px-8 py-4 rounded-2xl font-bold text-lg btn-modern hover-lift group">
              <Zap className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button variant="outline" className="glass border-2 border-cyan-400 text-cyan-600 hover:bg-gradient-blue hover:text-white px-8 py-4 rounded-2xl font-bold text-lg btn-modern hover-lift">
              Watch Demo
              <Video className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className={`group relative overflow-hidden border-0 shadow-modern bg-white/80 backdrop-blur-sm rounded-3xl transition-all duration-700 hover:shadow-xl-colored ${
                visibleCards[index] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Card Content */}
              <div className="relative z-10">
                <CardHeader className="text-center pb-6 pt-12">
                  <div className="relative mx-auto mb-8">
                    <div className={`w-24 h-24 bg-gradient-to-br ${service.color} rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <service.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="w-6 h-6 text-[#E17726] animate-pulse" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-midnight group-hover:text-[#E17726] transition-colors duration-300 mb-4">
                    {service.title}
                  </CardTitle>
                  
                  <p className="text-gray-600 leading-relaxed text-lg mb-6">
                    {service.description}
                  </p>
                </CardHeader>

                <CardContent className="px-8 pb-10">
                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex} 
                        className="flex items-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300"
                      >
                        <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full`}></div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-gray-200 text-gray-600 hover:border-[#E17726] hover:text-[#E17726] hover:bg-[#E17726]/5 rounded-2xl font-semibold py-3 transition-all duration-300 group-hover:scale-105"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-20 fade-in-section is-visible">
          <div className="glass p-12 rounded-3xl border border-white/20 hover-lift">
            <h3 className="text-3xl font-bold text-midnight mb-4">
              Ready to Transform Your Healthcare Experience?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of patients and healthcare providers who trust our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="bg-gradient-orange hover:shadow-xl-colored text-white px-10 py-4 rounded-2xl font-bold text-lg btn-modern hover-lift group">
                <Calendar className="w-6 h-6 mr-3" />
                Book Your First Consultation
                <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
              </Button>
              <Button variant="outline" className="glass border-2 border-cyan-400 text-cyan-600 hover:bg-gradient-blue hover:text-white px-8 py-4 rounded-2xl font-bold text-lg btn-modern hover-lift">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
