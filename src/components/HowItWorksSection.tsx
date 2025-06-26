
import React from 'react';
import { UserPlus, Video, FileText, ArrowRight } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      icon: UserPlus,
      title: "Register & Profile Setup",
      description: "Create your secure account and complete your health profile in minutes",
      color: "medical-blue"
    },
    {
      step: "02", 
      icon: Video,
      title: "Consult with Doctors",
      description: "Book appointments and connect with certified healthcare professionals",
      color: "medical-green"
    },
    {
      step: "03",
      icon: FileText,
      title: "Get Your Prescription",
      description: "Receive digital prescriptions and access your medical records instantly",
      color: "medical-blue"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-medical-gray max-w-2xl mx-auto">
            Getting started with SUSHRUSA eClinic is simple and straightforward. 
            Follow these three easy steps to begin your digital healthcare journey.
          </p>
        </div>

        <div className="relative">
          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Step Number */}
                <div className="relative mb-8">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    step.color === 'medical-blue' ? 'bg-medical-blue' : 'bg-medical-green'
                  }`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white border-4 border-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="text-sm font-bold text-medical-gray">{step.step}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-medical-gray">{step.description}</p>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 z-10">
                    <ArrowRight className="w-8 h-8 text-medical-gray/30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-medical-gray/20 -z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
