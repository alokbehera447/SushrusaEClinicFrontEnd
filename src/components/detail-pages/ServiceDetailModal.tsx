import React from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, CheckCircle, Star, Clock, Users, Shield, Award } from 'lucide-react';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  color: string;
  bgColor: string;
  price: string;
  duration: string;
  benefits: string[];
  process: string[];
  faqs: { question: string; answer: string; }[];
}

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, isOpen, onClose }) => {
  if (!isOpen || !service) return null;

  const testimonials = [
    {
      name: "Rajesh Kumar",
      review: "Excellent service! The doctor was very professional and the process was smooth.",
      rating: 5,
      location: "Delhi"
    },
    {
      name: "Priya Sharma", 
      review: "Quick and convenient. Got the help I needed without any hassle.",
      rating: 5,
      location: "Mumbai"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className={`bg-gradient-to-br ${service.bgColor} p-8 pb-6`}>
          <div className="flex items-start space-x-6">
            <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg`}>
              <service.icon className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl font-black text-midnight mb-3">{service.title}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">{service.description}</p>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-[#E17726] mr-2" />
                  <span className="font-semibold">{service.duration}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <div className="text-2xl font-black text-[#E17726]">{service.price}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Features */}
              <div>
                <h3 className="text-xl font-bold text-midnight mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-[#E17726]" />
                  What's Included
                </h3>
                <div className="space-y-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full mr-3`}></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-xl font-bold text-midnight mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-[#E17726]" />
                  Key Benefits
                </h3>
                <div className="space-y-3">
                  {service.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process */}
              <div>
                <h3 className="text-xl font-bold text-midnight mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-[#E17726]" />
                  How It Works
                </h3>
                <div className="space-y-4">
                  {service.process.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#E17726] to-[#FF8A56] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 pt-1">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Booking Card */}
              <div className="bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-midnight mb-4">Book This Service</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="text-2xl font-black text-midnight">{service.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">{service.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Availability</span>
                    <span className="font-semibold text-green-600">Same Day</span>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:shadow-xl-colored text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105 mt-6">
                    Book Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full bg-white border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white px-6 py-3 rounded-2xl font-bold transition-all duration-500"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>

              {/* Testimonials */}
              <div>
                <h4 className="text-xl font-bold text-midnight mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-[#E17726]" />
                  Patient Reviews
                </h4>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-midnight">{testimonial.name}</div>
                          <div className="text-sm text-gray-600">{testimonial.location}</div>
                        </div>
                        <div className="flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{testimonial.review}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h4 className="text-xl font-bold text-midnight mb-4">Frequently Asked Questions</h4>
                <div className="space-y-3">
                  {service.faqs.map((faq, index) => (
                    <details key={index} className="bg-gray-50 rounded-xl p-4">
                      <summary className="font-semibold text-midnight cursor-pointer">{faq.question}</summary>
                      <p className="text-gray-700 mt-2 text-sm">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailModal;