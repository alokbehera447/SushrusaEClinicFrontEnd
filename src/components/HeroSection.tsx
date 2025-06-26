
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Shield, Star, Users, Clock, Play } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="bg-white py-20 lg:py-32 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-earth-green/5 to-aqua/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-earth-green/10 px-5 py-3 rounded-full">
                <div className="w-2 h-2 bg-earth-green rounded-full"></div>
                <span className="text-sm font-semibold text-earth-green tracking-wide">HEALTHCARE REIMAGINED</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-midnight leading-tight">
                  Specialist Consults.
                  <span className="text-earth-green block">Just a Click Away</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-midnight/70 leading-relaxed max-w-2xl">
                  Instant access to verified doctors across departments—fast, secure, 
                  and built for every region. Quality healthcare at your fingertips.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Button size="lg" className="bg-earth-green hover:bg-earth-green/90 text-white px-10 py-4 rounded-xl font-semibold text-lg h-auto">
                <Calendar className="w-6 h-6 mr-3" />
                Book Consultation
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-aqua text-aqua hover:bg-aqua hover:text-white px-10 py-4 rounded-xl font-semibold text-lg h-auto"
              >
                <Video className="w-6 h-6 mr-3" />
                Start Video Call
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-10 pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-earth-green/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-earth-green" />
                </div>
                <span className="text-base text-midnight/70 font-medium">HIPAA Secure</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-aqua/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-aqua" />
                </div>
                <span className="text-base text-midnight/70 font-medium">24/7 Available</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-earth-green/10 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-earth-green" />
                </div>
                <span className="text-base text-midnight/70 font-medium">Top Rated</span>
              </div>
            </div>
          </div>

          {/* Right Content - Video and Image Grid */}
          <div className="relative">
            {/* Main Video Section */}
            <div className="relative rounded-3xl overflow-hidden shadow-modern bg-gradient-to-br from-earth-green/5 to-aqua/5">
              <video 
                className="w-full h-96 object-cover"
                autoPlay 
                muted 
                loop
                playsInline
              >
                <source src="https://videos.pexels.com/video-files/8375453/8375453-uhd_2732_1440_25fps.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/40 via-transparent to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Professional Healthcare</h3>
                  <p className="text-white/90 text-lg">Experience world-class medical care</p>
                </div>
              </div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-midnight/20">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors duration-300">
                  <Play className="w-8 h-8 text-earth-green ml-1" />
                </div>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-modern border border-sand-warm/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-earth-green/10 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-earth-green" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-midnight">4.9</div>
                  <div className="text-sm text-midnight/60">Patient Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
