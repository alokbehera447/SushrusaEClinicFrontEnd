import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Calendar, MapPin, Award, Sparkles, ArrowRight, Video, Clock } from 'lucide-react';

const doctors = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiologist',
    qualification: 'MBBS, MD, DM Cardiology',
    rating: 4.9,
    reviews: 1247,
    image: '/doctor-avatar-1.svg',
    experience: '12 Years',
    location: 'Delhi, Mumbai',
    price: '₹800',
    nextAvailable: 'Today 2:30 PM',
    languages: ['English', 'Hindi'],
    specializations: ['Heart Surgery', 'Cardiac Care', 'Preventive Cardiology']
  },
  {
    id: 2,
    name: 'Dr. Rahul Mehta',
    specialty: 'Neurologist',
    qualification: 'MBBS, MD, DM Neurology',
    rating: 4.8,
    reviews: 892,
    image: '/doctor-avatar-2.svg',
    experience: '10 Years',
    location: 'Bangalore, Chennai',
    price: '₹750',
    nextAvailable: 'Tomorrow 10:00 AM',
    languages: ['English', 'Tamil'],
    specializations: ['Brain Surgery', 'Epilepsy', 'Stroke Care']
  },
  {
    id: 3,
    name: 'Dr. Anjali Verma',
    specialty: 'Pediatrician',
    qualification: 'MBBS, MD Pediatrics',
    rating: 4.9,
    reviews: 1534,
    image: '/doctor-avatar-3.svg',
    experience: '8 Years',
    location: 'Pune, Hyderabad',
    price: '₹600',
    nextAvailable: 'Today 4:00 PM',
    languages: ['English', 'Hindi', 'Marathi'],
    specializations: ['Child Development', 'Vaccination', 'Pediatric Care']
  },
  {
    id: 4,
    name: 'Dr. Sameer Khan',
    specialty: 'Orthopedic Surgeon',
    qualification: 'MBBS, MS Orthopedics',
    rating: 4.8,
    reviews: 967,
    image: '/doctor-avatar-1.svg',
    experience: '15 Years',
    location: 'Kolkata, Gurgaon',
    price: '₹900',
    nextAvailable: 'Tomorrow 11:30 AM',
    languages: ['English', 'Hindi', 'Bengali'],
    specializations: ['Joint Replacement', 'Sports Medicine', 'Spine Surgery']
  }
];

const DoctorShowcase = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-sand-warm/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full border border-[#E17726]/20 mb-6">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-[#E17726] to-[#FF8A56] rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
            </div>
            <Sparkles className="w-5 h-5 text-[#E17726]" />
            <span className="text-sm font-bold text-[#E17726] tracking-wide">TOP SPECIALISTS</span>
            <Award className="w-5 h-5 text-cyan-600" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-midnight leading-tight">
            Meet Our 
            <span className="block text-[#E17726]">Expert Doctors</span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-4">
            Consult with board-certified specialists from the comfort of your home. 
            <span className="text-[#E17726] font-semibold"> Book instantly</span> and get expert care within minutes.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {doctors.map((doctor, index) => (
            <div key={doctor.id} className="group relative">
              <div className="bg-white rounded-3xl shadow-modern p-6 sm:p-8 text-center hover:shadow-xl-colored transition-all duration-500 hover:-translate-y-3 border border-gray-100/50">
                {/* Doctor Image */}
                <div className="relative mx-auto mb-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 mx-auto">
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Online Badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-midnight group-hover:text-[#E17726] transition-colors duration-300">
                    {doctor.name}
                  </h3>
                  
                  <div className="text-[#E17726] font-semibold text-base sm:text-lg">
                    {doctor.specialty}
                  </div>
                  
                  <div className="text-gray-600 text-sm">
                    {doctor.qualification}
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-[#E17726]" />
                      {doctor.experience}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-cyan-600" />
                      {doctor.location.split(',')[0]}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-semibold text-midnight">{doctor.rating}</span>
                    </div>
                    <span className="text-gray-400 text-sm">({doctor.reviews} reviews)</span>
                  </div>

                  {/* Next Available */}
                  <div className="glass px-4 py-2 rounded-xl">
                    <div className="text-xs text-gray-600 mb-1">Next Available</div>
                    <div className="font-semibold text-[#E17726] text-sm">{doctor.nextAvailable}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="text-2xl font-black text-midnight mb-2">
                    {doctor.price}
                    <span className="text-sm font-normal text-gray-600"> /consultation</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:shadow-xl-colored text-white px-6 py-3 rounded-2xl font-bold text-base transition-all duration-500 hover:scale-105 hover:-translate-y-1 group/btn"
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <Calendar className="w-5 h-5 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                    Book Consultation
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/80 backdrop-blur-sm border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white hover:border-[#E17726] px-6 py-3 rounded-2xl font-bold transition-all duration-500"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video Call
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Doctors CTA */}
        <div className="text-center mt-8 sm:mt-12">
          <Button 
            variant="outline" 
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white hover:border-[#E17726] px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-500 hover:shadow-xl-colored hover:scale-105 hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center">
              View All 500+ Doctors
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#E17726] to-[#FF8A56] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DoctorShowcase;