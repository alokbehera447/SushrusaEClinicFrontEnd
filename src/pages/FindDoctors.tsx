import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, Search, MapPin, Star, Calendar, Clock, Video, User, Award, Stethoscope, Sparkles, Navigation, Loader2, Phone } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  location: string;
  pincode: string;
  consultationFee: number;
  nextAvailable: string;
  consultationTypes: ('in-person' | 'video' | 'phone')[];
  distance?: number; // Distance from user in km
}

interface Ecenter {
  id: number;
  name: string;
  address: string;
  pincode: string;
  distance?: number;
  doctors: number;
  rating: number;
  services: string[];
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Ramesh Kumar",
    specialty: "Cardiology",
    experience: 15,
    rating: 4.8,
    reviews: 342,
    location: "Mumbai, Maharashtra",
    pincode: "400001",
    consultationFee: 800,
    nextAvailable: "Today 3:00 PM",
    consultationTypes: ["in-person", "video"]
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Dermatology",
    experience: 12,
    rating: 4.9,
    reviews: 287,
    location: "Delhi, Delhi",
    pincode: "110001",
    consultationFee: 600,
    nextAvailable: "Tomorrow 10:00 AM",
    consultationTypes: ["in-person", "video", "phone"]
  },
  {
    id: 3,
    name: "Dr. Arun Patel",
    specialty: "Orthopedics",
    experience: 20,
    rating: 4.7,
    reviews: 456,
    location: "Bangalore, Karnataka",
    pincode: "560001",
    consultationFee: 900,
    nextAvailable: "Monday 2:00 PM",
    consultationTypes: ["in-person"]
  },
  {
    id: 4,
    name: "Dr. Sneha Reddy",
    specialty: "Pediatrics",
    experience: 8,
    rating: 4.6,
    reviews: 198,
    location: "Hyderabad, Telangana",
    pincode: "500001",
    consultationFee: 500,
    nextAvailable: "Today 5:00 PM",
    consultationTypes: ["in-person", "video"]
  },
  {
    id: 5,
    name: "Dr. Vikram Singh",
    specialty: "Neurology",
    experience: 18,
    rating: 4.9,
    reviews: 312,
    location: "Chennai, Tamil Nadu",
    pincode: "600001",
    consultationFee: 1200,
    nextAvailable: "Wednesday 11:00 AM",
    consultationTypes: ["in-person", "video"]
  },
  {
    id: 6,
    name: "Dr. Meera Gupta",
    specialty: "Gynecology",
    experience: 14,
    rating: 4.8,
    reviews: 267,
    location: "Pune, Maharashtra",
    pincode: "411001",
    consultationFee: 700,
    nextAvailable: "Today 4:30 PM",
    consultationTypes: ["in-person", "video"]
  }
];

const mockEcenters: Ecenter[] = [
  {
    id: 1,
    name: "Sushrusa eClinic - Mumbai Central",
    address: "123, Marine Drive, Mumbai",
    pincode: "400001",
    doctors: 8,
    rating: 4.7,
    services: ["General Medicine", "Cardiology", "Dermatology"]
  },
  {
    id: 2,
    name: "Sushrusa eClinic - Delhi Central",
    address: "456, Connaught Place, Delhi",
    pincode: "110001",
    doctors: 12,
    rating: 4.8,
    services: ["General Medicine", "Orthopedics", "Pediatrics"]
  },
  {
    id: 3,
    name: "Sushrusa eClinic - Bangalore Central",
    address: "789, MG Road, Bangalore",
    pincode: "560001",
    doctors: 10,
    rating: 4.6,
    services: ["General Medicine", "Neurology", "Gynecology"]
  }
];

const specialties = ["All Specialties", "Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Neurology", "Gynecology"];
const locations = ["All Locations", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune"];

const FindDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('rating');
  const [userPincode, setUserPincode] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [showEcenters, setShowEcenters] = useState(false);

  // Detect user location on component mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    setIsDetectingLocation(true);
    
    try {
      // First try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await getPincodeFromCoordinates(latitude, longitude);
          },
          async (error) => {
            console.log('Geolocation failed, trying IP-based detection');
            await detectLocationByIP();
          }
        );
      } else {
        await detectLocationByIP();
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      setIsDetectingLocation(false);
    }
  };

  const detectLocationByIP = async () => {
    try {
      // Using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.postal) {
        setUserPincode(data.postal);
        setLocationDetected(true);
        setSelectedLocation(data.city || 'All Locations');
      }
    } catch (error) {
      console.error('IP-based location detection failed:', error);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const getPincodeFromCoordinates = async (lat: number, lng: number) => {
    try {
      // Using reverse geocoding to get pincode from coordinates
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=a0adc5981c9f44cab6c281cec3d515a0&countrycode=in`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const components = data.results[0].components;
        const pincode = components.postcode || components.pincode;
        if (pincode) {
          setUserPincode(pincode);
          setLocationDetected(true);
          setSelectedLocation(components.city || 'All Locations');
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback to IP-based detection
      await detectLocationByIP();
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const calculateDistance = (pincode1: string, pincode2: string) => {
    // Simple distance calculation (in real app, use proper geocoding API)
    // For demo, we'll use a simple logic based on pincode similarity
    const similarity = pincode1.slice(0, 3) === pincode2.slice(0, 3) ? 0.5 : 1;
    return Math.random() * 10 * similarity; // Random distance for demo
  };

  const filteredDoctors = mockDoctors
    .map(doctor => ({
      ...doctor,
      distance: userPincode ? calculateDistance(userPincode, doctor.pincode) : undefined
    }))
    .filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All Specialties' || doctor.specialty === selectedSpecialty;
      const matchesLocation = selectedLocation === 'All Locations' || doctor.location.includes(selectedLocation);
      return matchesSearch && matchesSpecialty && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'experience': return b.experience - a.experience;
        case 'fee': return a.consultationFee - b.consultationFee;
        case 'distance': return (a.distance || 999) - (b.distance || 999);
        default: return 0;
      }
    });

  const filteredEcenters = mockEcenters
    .map(ecenter => ({
      ...ecenter,
      distance: userPincode ? calculateDistance(userPincode, ecenter.pincode) : undefined
    }))
    .sort((a, b) => (a.distance || 999) - (b.distance || 999));

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-3 h-3" />;
      case 'phone': return <Phone className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="bg-[#E17726] p-2 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-midnight">SUSHRUSA</span>
              </Link>
              <h1 className="text-2xl font-bold text-midnight">Find Doctors</h1>
            </div>
            <Link to="/">
              <Button variant="outline" className="border-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Pincode/Search Bar - Reference Style */}
      <div className="w-full bg-[#f3f7fa] py-4 shadow-sm border-b border-gray-100 flex justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-3xl px-2">
          <div className="flex items-center bg-white rounded-full shadow px-4 py-2 gap-2 min-w-[120px]">
            <MapPin className="w-5 h-5 text-[#E17726]" />
            {locationDetected ? (
              <button
                className="font-semibold text-midnight focus:outline-none hover:underline"
                onClick={() => setUserPincode('')}
                title="Change location"
              >
                {userPincode}
              </button>
            ) : (
              <span className="text-gray-500 text-sm">Detecting...</span>
            )}
          </div>
          <form
            onSubmit={e => { e.preventDefault(); }}
            className="flex flex-1 items-center bg-white rounded-full shadow px-4 py-2 gap-2 min-w-[200px]"
          >
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for doctors or specialties..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-midnight placeholder-gray-400 text-base"
            />
            <button type="submit" className="focus:outline-none">
              <span className="sr-only">Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Location Info */}
      {locationDetected && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Showing results near Pincode: {userPincode}
                  </p>
                  <p className="text-xs text-green-600">
                    {filteredDoctors.length} doctors found in your area
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setUserPincode('')}
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Change Location
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="border-gray-200 focus:border-[#E17726] focus:ring-[#E17726]">
                <SelectValue placeholder="Select Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="border-gray-200 focus:border-[#E17726] focus:ring-[#E17726]">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-gray-200 focus:border-[#E17726] focus:ring-[#E17726]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="fee">Lowest Fee</SelectItem>
                {userPincode && <SelectItem value="distance">Nearest First</SelectItem>}
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowEcenters(false)}
                variant={!showEcenters ? "default" : "outline"}
                className={!showEcenters ? "bg-[#E17726] hover:bg-[#c9651e]" : ""}
              >
                Doctors
              </Button>
              <Button
                onClick={() => setShowEcenters(true)}
                variant={showEcenters ? "default" : "outline"}
                className={showEcenters ? "bg-[#E17726] hover:bg-[#c9651e]" : ""}
              >
                E-Centers
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-midnight">
              {showEcenters ? `${filteredEcenters.length} E-Centers Found` : `${filteredDoctors.length} Doctors Found`}
            </h2>
            <p className="text-gray-600 mt-1">
              {showEcenters ? 'Professional consultation centers near you' : 'Book appointments with top specialists'}
            </p>
          </div>
        </div>

        {!showEcenters ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <Card key={doctor.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105">
                <CardContent className="p-6">
                  {/* Doctor Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-full flex items-center justify-center shadow-md">
                      <Stethoscope className="w-8 h-8 text-[#E17726]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-midnight truncate group-hover:text-[#E17726] transition-colors">
                        {doctor.name}
                      </h3>
                      <p className="text-[#E17726] font-semibold text-sm">{doctor.specialty}</p>
                      <div className="flex items-center mt-2 space-x-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold ml-1">{doctor.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({doctor.reviews})</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 ml-1">{doctor.experience} yrs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location and Availability */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-[#E17726]" />
                      <span className="truncate">{doctor.location}</span>
                      {doctor.distance !== undefined && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {doctor.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-[#E17726]" />
                      <span>Next: {doctor.nextAvailable}</span>
                    </div>
                  </div>

                  {/* Consultation Types */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doctor.consultationTypes.map(type => (
                      <Badge key={type} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                        {getConsultationIcon(type)}
                        <span className="ml-1">
                          {type === 'video' ? 'Video' : type === 'phone' ? 'Phone' : 'In-person'}
                        </span>
                      </Badge>
                    ))}
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#E17726]">
                        ₹{doctor.consultationFee}
                      </div>
                      <div className="text-xs text-gray-500">Consultation Fee</div>
                    </div>
                    <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEcenters.map(ecenter => (
              <Card key={ecenter.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:scale-105">
                <CardContent className="p-6">
                  {/* E-Center Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-[#E17726]/20 rounded-full flex items-center justify-center shadow-md">
                      <Sparkles className="w-8 h-8 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-midnight truncate group-hover:text-[#E17726] transition-colors">
                        {ecenter.name}
                      </h3>
                      <div className="flex items-center mt-2 space-x-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold ml-1">{ecenter.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 ml-1">{ecenter.doctors} doctors</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address and Distance */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-[#E17726]" />
                      <span className="truncate">{ecenter.address}</span>
                      {ecenter.distance !== undefined && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {ecenter.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {ecenter.services.map(service => (
                      <Badge key={service} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {service}
                      </Badge>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-700">
                        Professional Center
                      </div>
                      <div className="text-xs text-gray-500">Multiple Specialists</div>
                    </div>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                      <Calendar className="w-4 h-4 mr-2" />
                      Visit Center
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {((!showEcenters && filteredDoctors.length === 0) || (showEcenters && filteredEcenters.length === 0)) && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search filters or location.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctors; 