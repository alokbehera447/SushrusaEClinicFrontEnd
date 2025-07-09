import React, { useEffect, useRef, useState } from 'react';
import { UserPlus, Video, FileText, ArrowRight, Sparkles, Star, CheckCircle } from 'lucide-react';

const HowItWorksSection = () => {
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      step: "01",
      icon: UserPlus,
      title: "Create Your Profile",
      description: "Set up your secure health profile in under 3 minutes with our guided process",
      gradient: "from-[#E17726] to-[#FF8A56]",
      highlight: "3 min setup",
      features: ["Secure encryption", "Easy verification", "HIPAA compliant"]
    },
    {
      step: "02", 
      icon: Video,
      title: "Connect with Doctors",
      description: "Book consultations and meet with certified healthcare professionals instantly",
      gradient: "from-cyan-500 to-blue-500",
      highlight: "Instant booking",
      features: ["24/7 availability", "Expert doctors", "Video/Chat support"]
    },
    {
      step: "03",
      icon: FileText,
      title: "Receive Care",
      description: "Get digital prescriptions, treatment plans, and access your complete health records",
      gradient: "from-purple-500 to-pink-500",
      highlight: "Complete care",
      features: ["Digital prescriptions", "Treatment plans", "Health records"]
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('header-section')) {
              setIsHeaderVisible(true);
            } else {
              const stepIndex = parseInt(entry.target.getAttribute('data-step-index') || '0');
              setTimeout(() => {
                setVisibleSteps(prev => {
                  const newVisible = [...prev];
                  newVisible[stepIndex] = true;
                  return newVisible;
                });
              }, stepIndex * 300);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    const stepElements = document.querySelectorAll('.step-card');
    stepElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-32 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/3 to-transparent rounded-full blur-3xl animate-float animation-delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className={`header-section text-center mb-20 space-y-8 ${isHeaderVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <div className="inline-flex items-center space-x-3 glass px-8 py-4 rounded-full border border-[#E17726]/20 hover-glow group cursor-pointer">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
              <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
            </div>
            <Sparkles className="w-5 h-5 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-lg font-bold text-[#E17726] tracking-wide">SIMPLE PROCESS</span>
            <Star className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-midnight leading-tight">
              <span className="block">How SUSHRUSA</span>
              <span className="block text-[#E17726]">
                Works
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Experience seamless healthcare with our <span className="text-[#E17726] font-semibold">step-by-step process</span>. 
              From registration to consultation, we've simplified every aspect of your healthcare journey.
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1">
            <div className="relative h-full max-w-4xl mx-auto">
              <div className="h-full bg-gradient-to-r from-[#E17726] via-cyan-500 to-purple-500 rounded-full opacity-20"></div>
              <div className="absolute inset-0 h-full bg-gradient-to-r from-[#E17726] via-cyan-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <div 
                key={index} 
                data-step-index={index}
                className={`step-card text-center relative group ${
                  visibleSteps[index] 
                    ? 'animate-scale-in-bounce' 
                    : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step Card */}
                <div className="relative">
                  <div className="glass p-10 rounded-3xl shadow-xl-colored hover-lift transition-all duration-500 group-hover:shadow-2xl border border-white/20">
                    {/* Step Number and Icon */}
                    <div className="relative mb-8">
                      <div className={`w-28 h-28 bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative`}>
                        <step.icon className="w-14 h-14 text-white" />
                        
                        {/* Step number badge */}
                        <div className="absolute -top-3 -right-3 bg-midnight text-white rounded-xl w-12 h-8 flex items-center justify-center font-black text-sm shadow-modern">
                          {step.step}
                        </div>
                      </div>
                      
                      {/* Floating sparkle */}
                      <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Sparkles className="w-6 h-6 text-[#E17726] animate-pulse" />
                      </div>
                    </div>

                    {/* Highlight Badge */}
                    <div className="mb-6">
                      <div className={`inline-flex items-center space-x-2 glass px-4 py-2 rounded-full border bg-gradient-to-r ${step.gradient} text-white`}>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-bold">{step.highlight}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-midnight group-hover:text-[#E17726] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg mb-6">
                      {step.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Decorative element */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`w-8 h-8 bg-gradient-to-br ${step.gradient} rounded-lg flex items-center justify-center`}>
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Floating Background Element */}
                  <div className={`absolute -inset-4 bg-gradient-to-br ${step.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 -right-6 z-10">
                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center hover-scale cursor-pointer shadow-modern">
                      <ArrowRight className="w-8 h-8 text-[#E17726]" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-20 ${isHeaderVisible ? 'animate-fade-in-up animation-delay-800' : 'opacity-0'}`}>
          <div className="glass p-12 rounded-3xl border border-white/20 hover-lift max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-midnight mb-4">
              Ready to Start Your Healthcare Journey?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of patients who trust SUSHRUSA for their healthcare needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="glass px-8 py-4 rounded-2xl border border-[#E17726]/20 hover-glow">
                <span className="text-[#E17726] font-bold text-lg">Get started in 3 minutes</span>
              </div>
              <div className="glass px-8 py-4 rounded-2xl border border-cyan-400/20 hover-glow">
                <span className="text-cyan-600 font-bold text-lg">No setup fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
