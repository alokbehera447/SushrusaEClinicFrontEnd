
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "General Physician",
      content: "SUSHRUSA eClinic has revolutionized my practice. The platform is intuitive, secure, and my patients love the convenience.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Patient",
      content: "Getting healthcare has never been this easy. From booking to prescriptions, everything is seamless and professional.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Lisa Rodriguez",
      role: "Healthcare Administrator",
      content: "The admin dashboard provides incredible insights. Managing our digital practice is now efficient and streamlined.",
      rating: 5,
      avatar: "LR"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-aqua/5 to-earth-green/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center space-x-3 bg-aqua/10 px-6 py-3 rounded-full border border-aqua/20">
            <div className="w-2 h-2 bg-aqua rounded-full"></div>
            <span className="text-sm font-semibold text-aqua tracking-wide">TESTIMONIALS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-midnight leading-tight">
            Trusted by Thousands of
            <span className="text-aqua block">Healthcare Professionals</span>
          </h2>
          
          <p className="text-xl text-midnight/70 max-w-3xl mx-auto leading-relaxed">
            Join the growing community of patients and healthcare providers who trust 
            SUSHRUSA eClinic for their digital healthcare needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-soft hover:shadow-modern transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 pt-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-earth-green to-aqua rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-midnight">{testimonial.name}</h4>
                    <p className="text-midnight/60">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-earth-green text-earth-green" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-aqua/20" />
                  <p className="text-midnight/70 text-lg leading-relaxed pl-6">
                    "{testimonial.content}"
                  </p>
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
