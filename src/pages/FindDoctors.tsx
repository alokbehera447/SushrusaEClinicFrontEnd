import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, Search, MapPin, Star, Calendar, Clock, Video, User, Award, Stethoscope, Sparkles, Navigation, Loader2, Phone } from 'lucide-react';
import { doctorApi, PublicDoctorProfile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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

const mockEcenters: Ecenter[] = [
  {
    id: 1,
    name: "HealthFirst E-Center",
    address: "123 Main Street, Mumbai, Maharashtra 400001",
    pincode: "400001",
    doctors: 8,
    rating: 4.7,
    services: ["General Medicine", "Cardiology", "Dermatology"]
  },
  {
    id: 2,
    name: "Wellness Hub",
    address: "456 Park Avenue, Delhi, Delhi 110001",
    pincode: "110001",
    doctors: 12,
    rating: 4.8,
    services: ["Orthopedics", "Neurology", "Pediatrics"]
  },
  {
    id: 3,
    name: "CareConnect Center",
    address: "789 Tech Park, Bangalore, Karnataka 560001",
    pincode: "560001",
    doctors: 15,
    rating: 4.9,
    services: ["Gynecology", "Ophthalmology", "ENT"]
  }
];

const specializations = ["All Specialties", "Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Neurology", "Gynecology", "Ophthalmology", "ENT", "General Medicine"];
const locations = ["All Locations", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune"];

const FindDoctors = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('rating');
  const [userPincode, setUserPincode] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [showEcenters, setShowEcenters] = useState(false);
  
  // Real API data
  const [doctors, setDoctors] = useState<PublicDoctorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [pageSize, setPageSize] = useState(12);

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

  // Fetch doctors from API
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
        ordering: sortBy === 'rating' ? 'rating' : sortBy === 'experience' ? 'experience' : sortBy === 'fee' ? 'fee' : 'rating'
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedSpecialty !== 'All Specialties') {
        params.specialization = selectedSpecialty;
      }

      if (userPincode) {
        params.pincode = userPincode;
      }

      if (selectedLocation !== 'All Locations') {
        params.city = selectedLocation;
      }

      const response = await doctorApi.getPublicDoctors(params);
      setDoctors(response.results || []);
      setTotalDoctors(response.count || 0);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      });
      setDoctors([]);
      setTotalDoctors(0);
    } finally {
      setLoading(false);
    }
  };

  // Load doctors when filters change
  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, selectedSpecialty, selectedLocation, sortBy, currentPage, pageSize, userPincode]);

  const calculateDistance = (pincode1: string, pincode2: string) => {
    // Simple distance calculation (in real app, use proper geocoding API)
    // For demo, we'll use a simple logic based on pincode similarity
    const similarity = pincode1.slice(0, 3) === pincode2.slice(0, 3) ? 0.5 : 1;
    return Math.random() * 10 * similarity; // Random distance for demo
  };

  // Transform API data to match the expected format
  const transformedDoctors = doctors.map(doctor => ({
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialization,
    experience: doctor.experience_years,
    rating: doctor.rating,
    reviews: doctor.total_reviews,
    location: doctor.clinic_address || 'Location not specified',
    pincode: doctor.clinic_address?.match(/\d{6}/)?.[0] || '',
    consultationFee: doctor.consultation_fee,
    nextAvailable: 'Available for booking',
    consultationTypes: doctor.consultation_types,
    distance: userPincode && doctor.clinic_address?.match(/\d{6}/)?.[0] 
      ? calculateDistance(userPincode, doctor.clinic_address.match(/\d{6}/)?.[0] || '') 
      : undefined
  }));

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Specialty Filter */}
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="fee">Lowest Fee</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Detection */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={detectUserLocation}
                disabled={isDetectingLocation}
                className="flex items-center space-x-2"
              >
                {isDetectingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span>{isDetectingLocation ? 'Detecting...' : 'Detect My Location'}</span>
              </Button>
              {locationDetected && userPincode && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <MapPin className="w-4 h-4" />
                  <span>Detected: {userPincode}</span>
                </div>
              )}
            </div>

            {/* Toggle View */}
            <div className="flex items-center space-x-2">
              <Button
                variant={!showEcenters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowEcenters(false)}
                className="bg-[#E17726] hover:bg-[#c9651e]"
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Doctors
              </Button>
              <Button
                variant={showEcenters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowEcenters(true)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                E-Centers
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {!showEcenters ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : transformedDoctors.length > 0 ? (
              transformedDoctors.map(doctor => (
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
                        <span>{doctor.nextAvailable}</span>
                      </div>
                    </div>

                    {/* Consultation Types */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {doctor.consultationTypes.map(type => (
                        <Badge key={type} variant="secondary" className="text-xs bg-gray-100 text-gray-700 flex items-center">
                          {getConsultationIcon(type)}
                          <span className="ml-1 capitalize">{type}</span>
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
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No doctors found</h3>
                <p className="text-gray-500">Try adjusting your search filters or location.</p>
              </div>
            )}
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

        {/* Pagination */}
        {!showEcenters && totalDoctors > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalDoctors)} of {totalDoctors} doctors
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 px-2">
                Page {currentPage} of {Math.ceil(totalDoctors / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalDoctors / pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctors; 