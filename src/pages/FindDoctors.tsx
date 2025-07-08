import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, Search, MapPin, Star, Calendar, Clock, Video, Phone, User, Award, Stethoscope } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  reviews: number;
  location: string;
  consultationFee: number;
  availability: string[];
  profileImage: string;
  languages: string[];
  consultationTypes: ('in-person' | 'video' | 'phone')[];
  nextAvailable: string;
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Ramesh Kumar",
    specialty: "Cardiology",
    qualification: "MBBS, MD (Cardiology)",
    experience: 15,
    rating: 4.8,
    reviews: 342,
    location: "Mumbai, Maharashtra",
    consultationFee: 800,
    availability: ["Mon", "Tue", "Wed", "Fri"],
    profileImage: "/placeholder.svg",
    languages: ["English", "Hindi", "Marathi"],
    consultationTypes: ["in-person", "video"],
    nextAvailable: "Today 3:00 PM"
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Dermatology",
    qualification: "MBBS, MD (Dermatology)",
    experience: 12,
    rating: 4.9,
    reviews: 287,
    location: "Delhi, Delhi",
    consultationFee: 600,
    availability: ["Mon", "Wed", "Thu", "Sat"],
    profileImage: "/placeholder.svg",
    languages: ["English", "Hindi"],
    consultationTypes: ["in-person", "video", "phone"],
    nextAvailable: "Tomorrow 10:00 AM"
  },
  {
    id: 3,
    name: "Dr. Arun Patel",
    specialty: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics)",
    experience: 20,
    rating: 4.7,
    reviews: 456,
    location: "Bangalore, Karnataka",
    consultationFee: 900,
    availability: ["Tue", "Wed", "Thu", "Fri"],
    profileImage: "/placeholder.svg",
    languages: ["English", "Hindi", "Kannada"],
    consultationTypes: ["in-person"],
    nextAvailable: "Monday 2:00 PM"
  },
  {
    id: 4,
    name: "Dr. Sneha Reddy",
    specialty: "Pediatrics",
    qualification: "MBBS, MD (Pediatrics)",
    experience: 8,
    rating: 4.6,
    reviews: 198,
    location: "Hyderabad, Telangana",
    consultationFee: 500,
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    profileImage: "/placeholder.svg",
    languages: ["English", "Hindi", "Telugu"],
    consultationTypes: ["in-person", "video"],
    nextAvailable: "Today 5:00 PM"
  },
  {
    id: 5,
    name: "Dr. Vikram Singh",
    specialty: "Neurology",
    qualification: "MBBS, DM (Neurology)",
    experience: 18,
    rating: 4.9,
    reviews: 312,
    location: "Chennai, Tamil Nadu",
    consultationFee: 1200,
    availability: ["Mon", "Wed", "Fri"],
    profileImage: "/placeholder.svg",
    languages: ["English", "Hindi", "Tamil"],
    consultationTypes: ["in-person", "video"],
    nextAvailable: "Wednesday 11:00 AM"
  },
  {
    id: 6,
    name: "Dr. Meera Gupta",
    specialty: "Gynecology",
    qualification: "MBBS, MS (Gynecology)",
    experience: 14,
    rating: 4.8,
    reviews: 267,
    location: "Pune, Maharashtra",
    consultationFee: 700,
    availability: ["Tue", "Thu", "Fri", "Sat"],
    profileImage: "/placeholder.svg",
    languages: ["English", "Hindi", "Marathi"],
    consultationTypes: ["in-person", "video"],
    nextAvailable: "Today 4:30 PM"
  }
];

const specialties = ["All Specialties", "Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Neurology", "Gynecology"];
const locations = ["All Locations", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune"];

const FindDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('rating');

  const filteredDoctors = mockDoctors
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
        default: return 0;
      }
    });

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getConsultationLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'phone': return 'Phone';
      default: return 'In-person';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-orange-600 p-2 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">SUSHRUSA</span>
              </Link>
              <h1 className="text-2xl font-bold">Find Doctors</h1>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search doctors or specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="fee">Lowest Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {filteredDoctors.length} Doctors Found
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDoctors.map(doctor => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{doctor.name}</CardTitle>
                    <p className="text-orange-600 font-medium">{doctor.specialty}</p>
                    <p className="text-sm text-gray-600">{doctor.qualification}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600">{doctor.experience} years</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-sm text-gray-600 ml-1">({doctor.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {doctor.location}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-green-600">
                      ₹{doctor.consultationFee}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {doctor.nextAvailable}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {doctor.consultationTypes.map(type => (
                      <Badge key={type} variant="secondary" className="flex items-center space-x-1">
                        {getConsultationIcon(type)}
                        <span>{getConsultationLabel(type)}</span>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map(language => (
                      <Badge key={language} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button variant="outline">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No doctors found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctors; 