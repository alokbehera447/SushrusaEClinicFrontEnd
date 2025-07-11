import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Sparkles, Award, Users, CheckCircle, MapPin, Calendar } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Patient",
      location: "Mumbai, India",
      avatar: "/patient-avatar-1.svg",
      rating: 5,
      quote: "SUSHRUSA transformed my healthcare experience completely. The AI-powered consultations are incredibly accurate, and I can access world-class doctors instantly. It's like having a personal healthcare team available 24/7.",
      highlight: "Life-changing platform",
      verified: true,
      date: "2 days ago",
      category: "Patient Care"
    },
    {
      id: 2,
      name: "Dr. Rajesh Mehta",
      role: "Cardiologist",
      location: "Delhi, India",
      avatar: "/doctor-avatar-1.svg",
      rating: 5,
      quote: "As a healthcare provider, SUSHRUSA's platform has revolutionized how I connect with patients. The integrated tools for prescriptions, consultations, and patient management have increased my efficiency by 300%.",
      highlight: "300% efficiency boost",
      verified: true,
      date: "1 week ago",
      category: "Healthcare Provider"
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Working Mother",
      location: "Bangalore, India",
      avatar: "/patient-avatar-2.svg",
      rating: 5,
      quote: "With two young kids and a demanding job, SUSHRUSA has been a blessing. I can book consultations during my lunch break and get prescriptions delivered to my doorstep. The peace of mind is invaluable.",
      highlight: "Ultimate convenience",
      verified: true,
      date: "3 days ago",
      category: "Family Care"
    },
    {
      id: 4,
      name: "Dr. Anita Patel",
      role: "Pediatrician",
      location: "Ahmedabad, India",
      avatar: "/doctor-avatar-2.svg",
      rating: 5,
      quote: "The quality of video consultations is exceptional. I can examine patients remotely with crystal clear video and have all their medical history at my fingertips. It's the future of healthcare.",
      highlight: "Future of healthcare",
      verified: true,
      date: "5 days ago",
      category: "Telemedicine"
    }
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Happy Patients", color: "from-blue-500 to-cyan-500" },
    { icon: Star, value: "4.9/5", label: "Average Rating", color: "from-yellow-400 to-orange-500" },
    { icon: Award, value: "98%", label: "Satisfaction Rate", color: "from-green-500 to-emerald-500" },
    { icon: Heart, value: "24/7", label: "Available Support", color: "from-pink-500 to-rose-500" }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

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
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-4 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-[#E17726]/8 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-48 h-48 sm:w-80 sm:h-80 bg-gradient-to-br from-cyan-400/8 to-transparent rounded-full blur-3xl animate-float animation-delay-300"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 glass px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-[#E17726]/20 hover-glow group cursor-pointer">
            <div className="relative">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-orange rounded-full animate-pulse-glow"></div>
              <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-[#E17726] rounded-full animate-ping"></div>
            </div>
            <Quote className="w-4 h-4 text-[#E17726] group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xs sm:text-sm lg:text-lg font-bold text-[#E17726] tracking-wide">TRUSTED BY THOUSANDS</span>
            <Sparkles className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-midnight leading-tight">
              <span className="block">Real Stories from</span>
              <span className="block text-[#E17726] animate-gradient">
                Real People
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover how <span className="text-[#E17726] font-semibold">SUSHRUSA</span> is transforming healthcare experiences across India
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden glass p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center hover-lift cursor-pointer transition-all duration-500"
            >
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-midnight group-hover:text-[#E17726] transition-colors duration-300 mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Testimonial Display */}
        <div className="relative max-w-5xl mx-auto">
          {/* Featured Testimonial Card */}
          <Card className="group relative overflow-hidden glass border-0 shadow-xl-colored rounded-2xl sm:rounded-3xl hover-lift transition-all duration-700">
            <CardContent className="p-6 sm:p-8 lg:p-12">
              {/* Category Badge */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0 mb-6 sm:mb-8">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 px-3 sm:px-4 py-2 rounded-full border border-[#E17726]/20">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#E17726]" />
                  <span className="text-xs sm:text-sm font-bold text-[#E17726]">{currentTest.category}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(currentTest.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 text-[#E17726]/10">
                  <Quote className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed font-medium italic relative z-10">
                  "{currentTest.quote}"
                </p>
              </div>

              {/* Highlight */}
              <div className="inline-block bg-gradient-to-r from-[#E17726]/10 to-cyan-400/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-[#E17726]/20 mb-6 sm:mb-8">
                <span className="text-sm sm:text-lg font-bold text-[#E17726]">{currentTest.highlight}</span>
              </div>

              {/* Author Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6 pt-6 sm:pt-8 border-t border-gray-200/50">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#E17726]" />
                    </div>
                    {currentTest.verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-midnight">{currentTest.name}</h4>
                    <p className="text-sm sm:text-base text-[#E17726] font-semibold">{currentTest.role}</p>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{currentTest.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{currentTest.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 sm:-left-6 lg:-left-12">
            <Button
              onClick={prevTestimonial}
              variant="outline"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full glass border-2 border-white/50 text-[#E17726] hover:bg-[#E17726] hover:text-white shadow-lg hover-lift transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 -right-3 sm:-right-6 lg:-right-12">
            <Button
              onClick={nextTestimonial}
              variant="outline"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full glass border-2 border-white/50 text-[#E17726] hover:bg-[#E17726] hover:text-white shadow-lg hover-lift transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center space-x-1.5 sm:space-x-2 mt-8 sm:mt-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentTestimonial
                  ? 'bg-gradient-orange shadow-md scale-110'
                  : 'bg-gray-300/60 hover:bg-[#E17726]/80'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play Control */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <Button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            variant="outline"
            className="glass px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium text-gray-600 hover:text-[#E17726] transition-colors duration-300 border border-[#E17726]/20 hover:border-[#E17726]"
          >
            {isAutoPlaying ? '⏸️ Pause Auto-play' : '▶️ Resume Auto-play'}
          </Button>
        </div>

        {/* Additional Testimonials Grid - Only on larger screens */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="group relative overflow-hidden glass border-0 shadow-modern rounded-2xl hover-lift transition-all duration-500 cursor-pointer"
              onClick={() => goToTestimonial(index)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3 italic">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#E17726]" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-midnight">{testimonial.name}</h5>
                    <p className="text-xs text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
