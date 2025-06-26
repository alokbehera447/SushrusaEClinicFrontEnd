
import React from 'react';
import { UserPlus, Video, FileText, ArrowRight } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      icon: UserPlus,
      title: "Create Your Profile",
      description: "Set up your secure health profile in under 3 minutes with our guided process"
    },
    {
      step: "02", 
      icon: Video,
      title: "Connect with Doctors",
      description: "Book consultations and meet with certified healthcare professionals instantly"
    },
    {
      step: "03",
      icon: FileText,
      title: "Receive Care",
      description: "Get digital prescriptions, treatment plans, and access your complete health records"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-sand-warm/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center space-x-3 bg-earth-green/10 px-6 py-3 rounded-full border border-earth-green/20">
            <div className="w-2 h-2 bg-earth-green rounded-full"></div>
            <span className="text-sm font-semibold text-earth-green tracking-wide">SIMPLE PROCESS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-midnight leading-tight">
            Get Started in
            <span className="text-earth-green block">Three Easy Steps</span>
          </h2>
          
          <p className="text-xl text-midnight/70 max-w-3xl mx-auto leading-relaxed">
            Our streamlined process makes accessing quality healthcare simple, 
            fast, and completely secure.
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative group">
                {/* Step Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-soft hover:shadow-modern transition-all duration-500 hover:-translate-y-2">
                  {/* Step Number */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-earth-green to-aqua rounded-2xl flex items-center justify-center mx-auto shadow-modern">
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 bg-midnight text-white rounded-xl w-12 h-8 flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4 text-midnight group-hover:text-earth-green transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-midnight/70 leading-relaxed text-lg">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 -right-6 z-10">
                    <div className="w-12 h-12 bg-aqua/10 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-aqua" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
