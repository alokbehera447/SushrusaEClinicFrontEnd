import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Sparkles, Award, Users } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Patient",
      location: "Mumbai, India",
      avatar: "/placeholder.svg",
      rating: 5,
      quote: "SUSHRUSA transformed my healthcare experience completely. The AI-powered consultations are incredibly accurate, and I can access world-class doctors instantly. It's like having a personal healthcare team available 24/7.",
      highlight: "Life-changing platform",
      verified: true
    },
    {
      id: 2,
      name: "Dr. Rajesh Mehta",
      role: "Cardiologist",
      location: "Delhi, India",
      avatar: "/placeholder.svg",
      rating: 5,
      quote: "As a healthcare provider, SUSHRUSA's platform has revolutionized how I connect with patients. The integrated tools for prescriptions, consultations, and patient management have increased my efficiency by 300%.",
      highlight: "300% efficiency boost",
      verified: true
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Working Mother",
      location: "Bangalore, India",
      avatar: "/placeholder.svg",
      rating: 5,
      quote: "With two young kids and a demanding job, SUSHRUSA has been a blessing. I can book consultations during my lunch break and get prescriptions delivered to my doorstep. The peace of mind is invaluable.",
      highlight: "Ultimate convenience",
      verified: true
    },
    {
      id: 4,
      name: "Dr. Anita Patel",
      role: "Pediatrician",
      location: "Ahmedabad, India",
      avatar: "/placeholder.svg",
      rating: 5,
      quote: "The quality of video consultations is exceptional. I can examine patients remotely with crystal clear video and have all their medical history at my fingertips. It's the future of healthcare.",
      highlight: "Future of healthcare",
      verified: true
    }
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Happy Patients" },
    { icon: Star, value: "4.9/5", label: "Average Rating" },
    { icon: Award, value: "98%", label: "Satisfaction Rate" },
    { icon: Heart, value: "24/7", label: "Available Support" }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
    setIsAutoPlaying(false);
  };

  const currentTest = testimonials[currentTestimonial];

  return (
    <section className="py-32 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/10 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20 space-y-8">
          <div className="inline-flex items-center space-x-3 glass px-8 py-4 rounded-full border border-[#E17726]/20 hover-glow group cursor-pointer animate-fade-in-up">
            <Quote className="w-5 h-5 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-lg font-bold text-[#E17726] tracking-wide">PATIENT TESTIMONIALS</span>
            <Sparkles className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-midnight leading-tight animate-fade-in-up animation-delay-100">
              <span className="block">What Our Patients</span>
              <span className="block text-transparent bg-clip-text bg-gradient-orange animate-gradient">
                Are Saying
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Join thousands of satisfied patients who have transformed their healthcare experience with 
              <span className="text-[#E17726] font-semibold"> SUSHRUSA's innovative platform</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`glass p-6 rounded-2xl text-center hover-lift group cursor-pointer animate-scale-in animation-delay-${(index + 1) * 100}`}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-8 h-8 text-[#E17726] group-hover:text-cyan-600 transition-colors duration-300" />
              </div>
              <div className="text-3xl font-black text-midnight group-hover:text-[#E17726] transition-colors duration-300 mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Testimonial Display */}
        <div className="relative max-w-5xl mx-auto">
          <Card className="glass border-0 shadow-xl-colored rounded-3xl overflow-hidden hover-lift group">
            <CardContent className="p-12 md:p-16">
              {/* Quote Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-gradient-orange rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Quote className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="text-center space-y-8">
                <div className="relative">
                  <p className="text-2xl md:text-3xl text-gray-700 leading-relaxed font-medium italic">
                    "{currentTest.quote}"
                  </p>
                  <div className="absolute -top-4 -left-4 text-[#E17726]/20">
                    <Quote className="w-16 h-16" />
                  </div>
                </div>

                {/* Highlight */}
                <div className="inline-block bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 px-6 py-3 rounded-full border border-[#E17726]/20">
                  <span className="text-lg font-bold text-[#E17726]">{currentTest.highlight}</span>
                </div>

                {/* Rating */}
                <div className="flex justify-center items-center space-x-2">
                  {[...Array(currentTest.rating)].map((_, i) => (
                    <Star key={i} className="w-8 h-8 text-yellow-400 fill-current hover:scale-110 transition-transform duration-200" />
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 pt-8 border-t border-gray-200/50">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg hover-scale">
                      <Users className="w-10 h-10 text-gray-500" />
                    </div>
                    {currentTest.verified && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-bold text-midnight">{currentTest.name}</h4>
                    <p className="text-lg text-[#E17726] font-semibold">{currentTest.role}</p>
                    <p className="text-gray-600">{currentTest.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-6 md:-left-12">
            <Button
              onClick={prevTestimonial}
              className="w-12 h-12 md:w-16 md:h-16 glass hover:bg-gradient-orange hover:text-white rounded-full p-0 shadow-xl hover-lift transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-6 md:-right-12">
            <Button
              onClick={nextTestimonial}
              className="w-12 h-12 md:w-16 md:h-16 glass hover:bg-gradient-orange hover:text-white rounded-full p-0 shadow-xl hover-lift transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center space-x-3 mt-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentTestimonial
                  ? 'bg-gradient-orange shadow-xl scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Auto-play Toggle */}
        <div className="text-center mt-8">
          <Button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            variant="outline"
            className="glass border-2 border-gray-300 text-gray-600 hover:border-[#E17726] hover:text-[#E17726] px-6 py-3 rounded-full font-semibold"
          >
            {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
          </Button>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="glass p-12 rounded-3xl border border-white/20 hover-lift">
            <h3 className="text-3xl font-bold text-midnight mb-4">
              Ready to Join Our Happy Patients?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience world-class healthcare with SUSHRUSA today
            </p>
            <Button className="bg-gradient-orange hover:shadow-xl-colored text-white px-10 py-4 rounded-2xl font-bold text-lg btn-modern hover-lift group">
              <Heart className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
              Start Your Journey
              <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
