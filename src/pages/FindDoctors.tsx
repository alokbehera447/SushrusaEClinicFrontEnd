import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Star, Calendar, Video, Clock, ArrowRight, ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  rating: number;
  reviews: number;
  experience: string;
  location: string;
  price: string;
  image: string;
  nextAvailable: string;
  languages: string[];
  isOnline: boolean;
}

const FindDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const specialties = [
    'All', 'Cardiology', 'Dermatology', 'General Medicine', 'Pediatrics', 
    'Orthopedics', 'Neurology', 'Gynecology', 'Psychiatry', 'Ophthalmology'
  ];

  const locations = [
    'All', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune'
  ];

  const doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiology',
      qualification: 'MBBS, MD, DM Cardiology',
      rating: 4.9,
      reviews: 1247,
      experience: '12 Years',
      location: 'Delhi',
      price: '₹800',
      image: '/doctor-avatar-1.svg',
      nextAvailable: 'Today 2:30 PM',
      languages: ['English', 'Hindi'],
      isOnline: true
    },
    {
      id: 2,
      name: 'Dr. Rahul Mehta',
      specialty: 'Neurology',
      qualification: 'MBBS, MD, DM Neurology',
      rating: 4.8,
      reviews: 892,
      experience: '10 Years',
      location: 'Mumbai',
      price: '₹750',
      image: '/doctor-avatar-2.svg',
      nextAvailable: 'Tomorrow 10:00 AM',
      languages: ['English', 'Hindi', 'Marathi'],
      isOnline: true
    },
    {
      id: 3,
      name: 'Dr. Anjali Verma',
      specialty: 'Pediatrics',
      qualification: 'MBBS, MD Pediatrics',
      rating: 4.9,
      reviews: 1534,
      experience: '8 Years',
      location: 'Bangalore',
      price: '₹600',
      image: '/doctor-avatar-3.svg',
      nextAvailable: 'Today 4:00 PM',
      languages: ['English', 'Hindi', 'Kannada'],
      isOnline: false
    },
    {
      id: 4,
      name: 'Dr. Sameer Khan',
      specialty: 'Orthopedics',
      qualification: 'MBBS, MS Orthopedics',
      rating: 4.8,
      reviews: 967,
      experience: '15 Years',
      location: 'Chennai',
      price: '₹900',
      image: '/doctor-avatar-1.svg',
      nextAvailable: 'Tomorrow 11:30 AM',
      languages: ['English', 'Hindi', 'Tamil'],
      isOnline: true
    },
    {
      id: 5,
      name: 'Dr. Neha Singh',
      specialty: 'Dermatology',
      qualification: 'MBBS, MD Dermatology',
      rating: 4.7,
      reviews: 756,
      experience: '9 Years',
      location: 'Hyderabad',
      price: '₹700',
      image: '/doctor-avatar-2.svg',
      nextAvailable: 'Today 3:00 PM',
      languages: ['English', 'Hindi', 'Telugu'],
      isOnline: true
    },
    {
      id: 6,
      name: 'Dr. Vikram Gupta',
      specialty: 'General Medicine',
      qualification: 'MBBS, MD Internal Medicine',
      rating: 4.6,
      reviews: 1123,
      experience: '14 Years',
      location: 'Kolkata',
      price: '₹500',
      image: '/doctor-avatar-1.svg',
      nextAvailable: 'Today 5:30 PM',
      languages: ['English', 'Hindi', 'Bengali'],
      isOnline: true
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    const matchesLocation = selectedLocation === 'All' || doctor.location === selectedLocation;
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return parseInt(a.price.slice(1)) - parseInt(b.price.slice(1));
      case 'experience':
        return parseInt(b.experience) - parseInt(a.experience);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button - Top Left */}
          <div className="mt-6 mb-8">
            <Link to="/" className="inline-flex items-center bg-white/90 backdrop-blur-sm border-2 border-[#E17726] text-[#E17726] hover:text-white hover:bg-[#E17726] px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-midnight mb-4">
              Find Your Perfect
              <span className="block text-[#E17726]">Healthcare Partner</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Connect with board-certified doctors and specialists. Book consultations, get expert advice, 
              and receive quality healthcare from the comfort of your home.
            </p>
            
            <div className="text-sm text-gray-600 bg-white rounded-full px-6 py-2 inline-block shadow-soft">
              {filteredDoctors.length} doctors available
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-modern p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-midnight">Filters</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('All');
                      setSelectedLocation('All');
                      setSortBy('rating');
                    }}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-midnight mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Doctor name or specialty..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none"
                    />
                  </div>
                </div>

                {/* Specialty Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-midnight mb-2">Specialty</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none"
                  >
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-midnight mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-midnight mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="price">Price: Low to High</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-2xl shadow-modern p-6 hover:shadow-xl-colored transition-all duration-300 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    {/* Doctor Image */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                      </div>
                      {/* Online Status */}
                      {doctor.isOnline && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-midnight">{doctor.name}</h3>
                          <div className="text-[#E17726] font-semibold">{doctor.specialty}</div>
                        </div>
                        <Button variant="outline" size="sm" className="p-2">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-gray-600 text-sm mb-3">{doctor.qualification}</div>

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-semibold">{doctor.rating}</span>
                          <span className="ml-1">({doctor.reviews})</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-[#E17726] mr-1" />
                          {doctor.experience}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-cyan-600 mr-1" />
                          {doctor.location}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {doctor.languages.map((language, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                            {language}
                          </span>
                        ))}
                      </div>

                      {/* Availability */}
                      <div className="bg-green-50 rounded-lg p-2 mb-4">
                        <div className="text-xs text-green-700 font-medium">Next Available</div>
                        <div className="text-sm font-bold text-green-800">{doctor.nextAvailable}</div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-black text-midnight">{doctor.price}</div>
                          <div className="text-xs text-gray-600">per consultation</div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="px-3 py-2 rounded-lg border-[#E17726]/30 text-[#E17726] hover:bg-[#E17726] hover:text-white"
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                          <Button 
                            size="sm"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white hover:shadow-lg"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-midnight mb-2">No doctors found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search filters to find more doctors.</p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('All');
                    setSelectedLocation('All');
                  }}
                  className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FindDoctors;