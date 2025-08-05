import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Sparkles, Award, Users, CheckCircle, MapPin, Calendar, X, Minimize2, Maximize2 } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        // Expanded View
        <Card className="w-96 max-h-[600px] shadow-2xl border border-gray-200 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-[#E17726] to-[#FF8A56] rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-[#E17726]">TRUSTED BY THOUSANDS</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="text-xs text-gray-600 hover:text-[#E17726]"
                >
                  {isAutoPlaying ? '⏸️' : '▶️'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-600 hover:text-[#E17726]"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="text-gray-600 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-midnight mb-1">
                Real Stories from <span className="text-[#E17726]">Real People</span>
              </h3>
              <p className="text-xs text-gray-600">
                Discover how SUSHRUSA is transforming healthcare experiences across India
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-bold text-midnight">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="relative">
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-[#E17726]/10 text-[#E17726] px-2 py-1 rounded">
                    {currentTest.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[...Array(currentTest.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 italic mb-2">
                  "{currentTest.quote}"
                </p>
                
                <span className="inline-block bg-[#E17726]/10 text-[#E17726] text-xs font-bold px-2 py-1 rounded mb-2">
                  {currentTest.highlight}
                </span>
                
                <div className="flex items-center">
                  <img src={currentTest.avatar} alt={currentTest.name} className="w-8 h-8 rounded-full border border-gray-200 mr-2" />
                  <div>
                    <div className="text-sm font-semibold text-midnight">{currentTest.name}</div>
                    <div className="text-xs text-gray-500">{currentTest.role}</div>
                  </div>
                  {currentTest.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={prevTestimonial}
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex space-x-1">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentTestimonial
                          ? 'bg-[#E17726]'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={nextTestimonial}
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Collapsed View
        <Card className="w-80 shadow-2xl border border-gray-200 bg-white/95 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300" onClick={() => setIsExpanded(true)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#E17726] to-[#FF8A56] rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-[#E17726]">TRUSTED BY THOUSANDS</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="text-gray-600 hover:text-red-500 p-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="mb-3">
              <h3 className="text-sm font-bold text-midnight mb-1">
                Real Stories from <span className="text-[#E17726]">Real People</span>
              </h3>
              <p className="text-xs text-gray-600">
                Discover how SUSHRUSA is transforming healthcare experiences
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-midnight">50K+</div>
                <div className="text-xs text-gray-600">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-midnight">4.9/5</div>
                <div className="text-xs text-gray-600">Average Rating</div>
              </div>
            </div>

            {/* Current Testimonial Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-[#E17726]/10 text-[#E17726] px-2 py-1 rounded">
                  {currentTest.category}
                </span>
                <div className="flex items-center space-x-1">
                  {[...Array(currentTest.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <p className="text-xs text-gray-700 italic mb-2 line-clamp-2">
                "{currentTest.quote}"
              </p>
              
              <div className="flex items-center">
                <img src={currentTest.avatar} alt={currentTest.name} className="w-6 h-6 rounded-full border border-gray-200 mr-2" />
                <div>
                  <div className="text-xs font-semibold text-midnight">{currentTest.name}</div>
                  <div className="text-xs text-gray-500">{currentTest.role}</div>
                </div>
                {currentTest.verified && (
                  <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-center mt-3">
              <span className="text-xs text-gray-500">Click to expand</span>
              <Maximize2 className="w-3 h-3 ml-1 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestimonialsSection;
