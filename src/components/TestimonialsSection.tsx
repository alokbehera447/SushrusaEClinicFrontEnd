
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "General Physician",
      content: "SUSHRUSA eClinic has revolutionized how I connect with my patients. The platform is intuitive and the video quality is excellent.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Patient",
      content: "Booking appointments and getting prescriptions has never been easier. The convenience is unmatched, especially during busy work schedules.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Lisa Rodriguez",
      role: "Healthcare Administrator",
      content: "The admin dashboard provides comprehensive insights and makes managing our practice incredibly efficient. Highly recommended!",
      rating: 5,
      avatar: "LR"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-medical-blue/5 to-medical-green/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-medical-gray max-w-2xl mx-auto">
            Join thousands of satisfied patients and healthcare providers who trust 
            SUSHRUSA eClinic for their digital healthcare needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-medical-blue to-medical-green rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-medical-gray">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-medical-blue/20" />
                  <CardDescription className="text-base text-medical-gray pl-6">
                    {testimonial.content}
                  </CardDescription>
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
