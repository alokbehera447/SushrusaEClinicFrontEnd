import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Star, Calendar, Video, Clock, ArrowRight, X, Heart, Loader2, AlertCircle } from 'lucide-react';
import { doctorApi, PublicDoctorProfile } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface FindDoctorsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const FindDoctorsPage: React.FC<FindDoctorsPageProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  
  // State for API data
  const [doctors, setDoctors] = useState<PublicDoctorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  
  // Available filter options - these will be populated from API data
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>(['All']);
  const [availableLocations, setAvailableLocations] = useState<string[]>(['All']);

  // Fetch doctors from API
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: pagination.page,
        page_size: pagination.pageSize,
        ordering: sortBy
      };
      
      // Add search parameters
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      if (selectedSpecialty !== 'All') {
        params.specialization = selectedSpecialty;
      }
      
      if (selectedLocation !== 'All') {
        params.city = selectedLocation;
      }
      
      console.log('Fetching doctors with params:', params);
      
      const response = await doctorApi.getPublicDoctors(params);
      console.log('Doctors API response:', response);
      
      if (response.results && Array.isArray(response.results)) {
        setDoctors(response.results);
        setPagination(prev => ({
          ...prev,
          total: response.count || 0,
          hasNext: !!response.next,
          hasPrevious: !!response.previous
        }));
        
        // Extract unique specialties and locations for filters
        const specialties = ['All', ...new Set(response.results.map(d => d.specialization))];
        const locations = ['All', ...new Set(response.results.map(d => d.clinic_address).filter(Boolean))];
        setAvailableSpecialties(specialties);
        setAvailableLocations(locations);
      } else {
        setDoctors([]);
        setPagination(prev => ({ ...prev, total: 0, hasNext: false, hasPrevious: false }));
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
      setDoctors([]);
      toast({
        title: 'Error',
        description: 'Failed to load doctors. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, sortBy, searchTerm, selectedSpecialty, selectedLocation, toast]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
      fetchDoctors();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedSpecialty, selectedLocation, sortBy]);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen, pagination.page]);

  // Helper functions
  const getConsultationFee = (doctor: PublicDoctorProfile) => {
    return doctor.online_consultation_fee || doctor.consultation_fee;
  };

  const getDefaultImage = () => '/doctor-avatar-1.svg';

  const getAvailabilityStatus = (doctor: PublicDoctorProfile) => {
    if (doctor.is_online_consultation_available) {
      return { text: 'Available for Online Consultation', color: 'green' };
    }
    return { text: 'In-person consultation only', color: 'blue' };
  };

  // Clear filters function
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('All');
    setSelectedLocation('All');
    setSortBy('rating');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-midnight">Find Doctors</h1>
                <p className="text-gray-600">Discover expert healthcare professionals</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${pagination.total} doctors found`}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
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
                    {availableSpecialties.map(specialty => (
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
                    {availableLocations.map(location => (
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
                    <option value="fee">Price: Low to High</option>
                    <option value="experience">Most Experienced</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="lg:col-span-3">
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-800">Error Loading Doctors</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                    <Button 
                      onClick={fetchDoctors} 
                      size="sm" 
                      className="mt-2 bg-red-600 hover:bg-red-700"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#E17726]" />
                <span className="ml-3 text-gray-600">Loading doctors...</span>
              </div>
            )}

            {/* Doctors Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-2xl shadow-modern p-6 hover:shadow-xl-colored transition-all duration-300 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    {/* Doctor Image */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src={doctor.profile_picture || getDefaultImage()} 
                          alt={doctor.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getDefaultImage();
                          }}
                        />
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

                      {doctor.clinic_name && (
                        <div className="text-gray-600 text-sm mb-2 font-medium">{doctor.clinic_name}</div>
                      )}
                      
                      {doctor.bio && (
                        <div className="text-gray-600 text-sm mb-3 line-clamp-2">{doctor.bio}</div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-semibold">{doctor.rating.toFixed(1)}</span>
                          <span className="ml-1">({doctor.total_reviews})</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-[#E17726] mr-1" />
                          {doctor.experience_years} Years
                        </div>
                        {doctor.clinic_address && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-cyan-600 mr-1" />
                            <span className="truncate max-w-20">{doctor.clinic_address}</span>
                          </div>
                        )}
                      </div>

                      {/* Languages */}
                      {doctor.languages_spoken && doctor.languages_spoken.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {doctor.languages_spoken.map((language, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                              {language}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Consultation Types */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {doctor.consultation_types.map((type, index) => (
                            <span 
                              key={index} 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                type === 'video' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {type === 'video' ? 'Video Consultation' : 'In-Person'}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Availability Status */}
                      <div className={`rounded-lg p-2 mb-4 ${
                        doctor.is_online_consultation_available ? 'bg-green-50' : 'bg-blue-50'
                      }`}>
                        <div className={`text-xs font-medium ${
                          doctor.is_online_consultation_available ? 'text-green-700' : 'text-blue-700'
                        }`}>
                          {getAvailabilityStatus(doctor).text}
                        </div>
                        {doctor.consultation_duration && (
                          <div className="text-xs text-gray-600">
                            Duration: {doctor.consultation_duration} minutes
                          </div>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-black text-midnight">₹{getConsultationFee(doctor)}</div>
                          <div className="text-xs text-gray-600">per consultation</div>
                          {doctor.online_consultation_fee && doctor.online_consultation_fee !== doctor.consultation_fee && (
                            <div className="text-xs text-[#E17726]">
                              Online: ₹{doctor.online_consultation_fee}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {doctor.is_online_consultation_available && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="px-3 py-2 rounded-lg border-[#E17726]/30 text-[#E17726] hover:bg-[#E17726] hover:text-white"
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Video
                            </Button>
                          )}
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

            {/* Pagination */}
            {!loading && !error && doctors.length > 0 && (pagination.hasNext || pagination.hasPrevious) && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.hasPrevious}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {pagination.page} • {pagination.total} total doctors
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && doctors.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-midnight mb-2">No doctors found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search filters to find more doctors.</p>
                <Button 
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDoctorsPage;