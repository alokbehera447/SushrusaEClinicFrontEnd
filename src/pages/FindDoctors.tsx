import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Star, Calendar, Video, Clock, ArrowRight, ArrowLeft, Heart, Loader2, AlertCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DoctorDetailsModal from '@/components/DoctorDetailsModal';
import { API_BASE_URL } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// Utility function to safely convert string to number
const safeNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  sub_specialization?: string;
  experience_years: number | string;
  consultation_fee: number | string;
  online_consultation_fee?: number;
  languages_spoken?: string | string[];
  bio?: string;
  rating: number | string;
  total_reviews: number | string;
  clinic_name?: string;
  clinic_address?: string;
  consultation_types: string[];
  is_online_consultation_available: boolean;
  consultation_duration: number;
  profile_picture?: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  results: Doctor[];
}

const FindDoctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State for doctors data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modal
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialization') || 'All');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('city') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('ordering') || 'rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  const specialties = [
    'All', 'Cardiology', 'Dermatology', 'General Medicine', 'Pediatrics', 
    'Orthopedics', 'Neurology', 'Gynecology', 'Psychiatry', 'Ophthalmology',
    'ENT', 'Urology', 'Oncology', 'Endocrinology', 'Gastroenterology'
  ];

  const locations = [
    'All', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune',
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane'
  ];

  // Function to fetch doctors from API
  const fetchDoctors = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ordering: sortBy === 'rating' ? 'rating' : 
                  sortBy === 'experience' ? 'experience' : 
                  sortBy === 'fee' ? 'fee' : 'rating'
      });

      // Add search filter
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Add specialization filter
      if (selectedSpecialty && selectedSpecialty !== 'All') {
        params.append('specialization', selectedSpecialty);
      }

      // Add location filter
      if (selectedLocation && selectedLocation !== 'All') {
        params.append('city', selectedLocation);
      }

      const response = await fetch(`${API_BASE_URL}/api/doctors/public/?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle the nested response structure from the API
      if (data.results && data.results.success) {
        const doctorsData = data.results.data || data.results;
        setDoctors(doctorsData);
        setPagination({
          count: data.count || 0,
          next: data.next,
          previous: data.previous,
          results: doctorsData
        });
      } else if (data.success) {
        // Handle direct success response
        setDoctors(data.data.results || data.data);
        setPagination({
          count: data.data.count || 0,
          next: data.data.next,
          previous: data.data.previous,
          results: data.data.results || data.data
        });
      } else {
        throw new Error(data.message || 'Failed to fetch doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch doctors when filters change
  useEffect(() => {
    fetchDoctors(currentPage);
  }, [searchTerm, selectedSpecialty, selectedLocation, sortBy, currentPage]);

  // Effect to update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedSpecialty !== 'All') params.set('specialization', selectedSpecialty);
    if (selectedLocation !== 'All') params.set('city', selectedLocation);
    if (sortBy !== 'rating') params.set('ordering', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchTerm, selectedSpecialty, selectedLocation, sortBy, currentPage, setSearchParams]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDoctors(1);
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate pagination info
  const totalPages = pagination ? Math.ceil(pagination.count / pageSize) : 0;
  const hasNextPage = pagination?.next !== null;
  const hasPrevPage = pagination?.previous !== null;

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('All');
    setSelectedLocation('All');
    setSortBy('rating');
    setCurrentPage(1);
  };

  // Handle view details
  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  // Handle book now - redirect to login
  const handleBookNow = (doctor: Doctor) => {
    navigate('/login', { 
      state: { 
        returnUrl: '/find-doctors',
        message: 'Please login to book an appointment with Dr. ' + doctor.name 
      } 
    });
  };

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
              {loading ? 'Loading doctors...' : `${pagination?.count || 0} doctors available`}
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
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search doctors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none"
                    />
                  </div>
                </form>

                {/* Specialty Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-midnight mb-2">Specialty</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => {
                      setSelectedSpecialty(e.target.value);
                      handleFilterChange();
                    }}
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
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      handleFilterChange();
                    }}
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
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      handleFilterChange();
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#E17726] focus:ring-2 focus:ring-[#E17726]/20 outline-none"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="fee">Price: Low to High</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#E17726] mx-auto mb-4" />
                  <p className="text-gray-600">Loading doctors...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-midnight mb-2">Error loading doctors</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button 
                    onClick={() => fetchDoctors(currentPage)}
                    className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Doctors Grid */}
            {!loading && !error && doctors.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="bg-white rounded-2xl shadow-modern p-6 hover:shadow-xl-colored transition-all duration-300 border border-gray-100">
                      <div className="flex items-start space-x-4">
                        {/* Doctor Image */}
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                            {doctor.profile_picture ? (
                              <img src={doctor.profile_picture} alt={doctor.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#E17726] to-[#FF8A56] flex items-center justify-center text-white font-bold text-lg">
                                {doctor.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                          </div>
                          {/* Online Status */}
                          {doctor.is_online_consultation_available && (
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
                              <div className="text-[#E17726] font-semibold">{doctor.specialization}</div>
                              {doctor.sub_specialization && (
                                <div className="text-sm text-gray-600">{doctor.sub_specialization}</div>
                              )}
                            </div>
                            <Button variant="outline" size="sm" className="p-2">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                                             <span className="font-semibold">{safeNumber(doctor.rating).toFixed(1)}</span>
                                                             <span className="ml-1">({safeNumber(doctor.total_reviews)})</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-[#E17726] mr-1" />
                                                             {safeNumber(doctor.experience_years)} Years
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-cyan-600 mr-1" />
                              {doctor.clinic_address || 'Location not specified'}
                            </div>
                          </div>

                                                     {/* Languages */}
                           {doctor.languages_spoken && (
                             <div className="flex flex-wrap gap-1 mb-3">
                               {Array.isArray(doctor.languages_spoken) 
                                 ? doctor.languages_spoken.map((language, index) => (
                                     <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                       {language}
                                     </span>
                                   ))
                                 : doctor.languages_spoken.split(',').map((language, index) => (
                                     <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                       {language.trim()}
                                     </span>
                                   ))
                               }
                             </div>
                           )}

                          {/* Consultation Types */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {doctor.consultation_types.map((type, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {type === 'in-person' ? 'In-Person' : type === 'video' ? 'Video' : type}
                              </span>
                            ))}
                          </div>

                          {/* Price and Actions */}
                          <div className="flex items-center justify-between">
                            <div>
                                                             <div className="text-2xl font-black text-midnight">₹{safeNumber(doctor.consultation_fee).toLocaleString()}</div>
                              <div className="text-xs text-gray-600">per consultation</div>
                            </div>
                            
                                                         <div className="flex space-x-2">
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
                                 onClick={() => handleViewDetails(doctor)}
                               >
                                 View Details
                               </Button>
                               <Button 
                                 size="sm"
                                 className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white"
                                 onClick={() => handleBookNow(doctor)}
                               >
                                 Book Now
                               </Button>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrevPage}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={currentPage === pageNum ? "bg-[#E17726] text-white" : ""}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage}
                      className="flex items-center space-x-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!loading && !error && doctors.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-midnight mb-2">No doctors found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search filters to find more doctors.</p>
                  <Button 
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Details Modal */}
      <DoctorDetailsModal
        doctor={selectedDoctor}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBookNow={handleBookNow}
      />

      <Footer />
    </div>
  );
};

export default FindDoctors;