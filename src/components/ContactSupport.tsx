import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, HelpCircle, Sparkles, Clock, Users } from 'lucide-react';

const ContactSupport = () => (
  <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
    {/* Background Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl"></div>
    </div>

    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full border border-[#E17726]/20 mb-6">
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-[#E17726] to-[#FF8A56] rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
          </div>
          <Sparkles className="w-5 h-5 text-[#E17726]" />
          <span className="text-sm font-bold text-[#E17726] tracking-wide">24/7 SUPPORT</span>
          <Users className="w-5 h-5 text-cyan-600" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-midnight leading-tight mb-4">
          Need Help?
          <span className="block text-[#E17726]">We're Here for You</span>
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Our dedicated support team is available 24/7 to assist you. 
          <span className="text-[#E17726] font-semibold"> Get instant help</span> whenever you need it.
        </p>
      </div>

      {/* Main Support Card */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-xl-colored p-8 sm:p-12 border border-gray-100/50 mb-8 sm:mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E17726] to-[#FF8A56] rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-midnight mb-1">24/7 Availability</h3>
                <p className="text-gray-600">Round-the-clock support for all your healthcare needs</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-midnight mb-1">Email Support</h3>
                <a href="mailto:support@sushrusa.com" className="text-[#E17726] font-semibold text-lg hover:underline">
                  support@sushrusa.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-midnight mb-1">Live Chat</h3>
                <p className="text-gray-600">Instant messaging with our support specialists</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:shadow-xl-colored text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105 hover:-translate-y-1">
              <MessageCircle className="w-6 h-6 mr-3" />
              Start Live Chat
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full bg-white/80 backdrop-blur-sm border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white hover:border-[#E17726] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500"
            >
              <Mail className="w-6 h-6 mr-3" />
              Send Email
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full bg-white/80 backdrop-blur-sm border-2 border-cyan-400/30 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:border-cyan-500 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500"
            >
              <HelpCircle className="w-6 h-6 mr-3" />
              Visit FAQ
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-black text-[#E17726] mb-2">&lt; 30s</div>
          <div className="text-gray-600 font-medium">Average Response Time</div>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-black text-[#E17726] mb-2">98%</div>
          <div className="text-gray-600 font-medium">Customer Satisfaction</div>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-black text-[#E17726] mb-2">24/7</div>
          <div className="text-gray-600 font-medium">Always Available</div>
        </div>
      </div>
    </div>
  </section>
);

export default ContactSupport;