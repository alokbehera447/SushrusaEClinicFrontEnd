import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Map,
  List,
  RefreshCw,
  MapPin as Location,
  Ruler,
  Star as Rating,
  Phone,
  Mail,
  Globe,
  Eye,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { publicApi, EClinic } from '@/lib/api';

interface NearbyEClinicsProps {
  onClinicSelect?: (clinic: EClinic) => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface ClinicWithDistance extends EClinic {
  distance: number;
  distanceText: string;
}

const NearbyEClinics: React.FC<NearbyEClinicsProps> = ({ onClinicSelect }) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyClinics, setNearbyClinics] = useState<ClinicWithDistance[]>([]);
  const [allClinics, setAllClinics] = useState<EClinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [showMap, setShowMap] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicWithDistance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get user's current location
  const getUserLocation = useCallback(async (): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get address from coordinates
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const data = await response.json();
            const address = data.display_name || '';
            
            resolve({ latitude, longitude, address });
          } catch (error) {
            console.log('Could not get address, using coordinates only:', error);
            resolve({ latitude, longitude });
          }
        },
        (error) => {
          reject(new Error(`Unable to retrieve your location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Format distance for display
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  };

  // Get current location and fetch nearby clinics
  const getCurrentLocationAndClinics = async () => {
    setLocationLoading(true);
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      toast.success('Location detected successfully!');
      
      // Fetch all clinics and calculate distances
      await fetchNearbyClinics(location);
    } catch (error: any) {
      console.error('Error getting location:', error);
      toast.error(error.message || 'Failed to get your location');
      
      // Fallback: fetch clinics without location
      await fetchNearbyClinics();
    } finally {
      setLocationLoading(false);
    }
  };

  // Fetch nearby clinics
  const fetchNearbyClinics = async (location?: UserLocation) => {
    setLoading(true);
    try {
      const response = await publicApi.getPublicEClinics({
        page_size: 100, // Get more clinics for better nearby results
        is_active: 'true',
        is_verified: 'true'
      });

      let clinicsWithDistance: ClinicWithDistance[] = response.results.map(clinic => {
        let distance = Infinity;
        let distanceText = 'Unknown';

        if (location && clinic.latitude && clinic.longitude) {
          distance = calculateDistance(
            location.latitude,
            location.longitude,
            clinic.latitude,
            clinic.longitude
          );
          distanceText = formatDistance(distance);
        }

        return {
          ...clinic,
          distance,
          distanceText
        };
      });

      // Filter by max distance if location is available
      if (location) {
        clinicsWithDistance = clinicsWithDistance.filter(clinic => clinic.distance <= maxDistance);
      }

      // Sort clinics
      clinicsWithDistance.sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            return a.distance - b.distance;
          case 'rating':
            // Assuming rating is stored somewhere, for now use distance
            return a.distance - b.distance;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return a.distance - b.distance;
        }
      });

      setAllClinics(response.results);
      setNearbyClinics(clinicsWithDistance);
    } catch (error: any) {
      console.error('Error fetching clinics:', error);
      toast.error('Failed to fetch nearby clinics. Please try again later.');
      
      // Set empty arrays to show no results
      setAllClinics([]);
      setNearbyClinics([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter clinics based on search and filters
  const filteredClinics = nearbyClinics.filter(clinic => {
    const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clinic.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clinic.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesCity = selectedCity === 'all' || !selectedCity || clinic.city === selectedCity;
    const matchesState = selectedState === 'all' || !selectedState || clinic.state === selectedState;

    return matchesSearch && matchesCity && matchesState;
  });

  // Get unique cities and states for filters
  const cities = [...new Set(allClinics.map(clinic => clinic.city))].sort();
  const states = [...new Set(allClinics.map(clinic => clinic.state))].sort();

  // Initialize on component mount
  useEffect(() => {
    getCurrentLocationAndClinics();
  }, []);

  // Refresh when filters change
  useEffect(() => {
    if (userLocation) {
      fetchNearbyClinics(userLocation);
    }
  }, [maxDistance, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Nearby E-Clinics</h1>
          <p className="text-muted-foreground">
            Discover e-clinics in your area for convenient healthcare access
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={getCurrentLocationAndClinics}
            disabled={locationLoading}
            className="flex items-center gap-2"
          >
            {locationLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh Location
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="flex items-center gap-2"
          >
            {viewMode === 'list' ? <Map className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {viewMode === 'list' ? 'Map View' : 'List View'}
          </Button>
        </div>
      </div>

      {/* Location Status */}
      {userLocation && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Location className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Location Detected</p>
                <p className="text-sm text-green-600">
                  {userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search clinics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* City Filter */}
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* State Filter */}
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: 'distance' | 'rating' | 'name') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distance Filter */}
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm font-medium">Max Distance:</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-600">{maxDistance}km</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {filteredClinics.length} E-Clinic{filteredClinics.length !== 1 ? 's' : ''} Found
          </h2>
          {userLocation && (
            <p className="text-sm text-gray-600">
              Within {maxDistance}km of your location
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Finding nearby clinics...</span>
          </div>
        ) : filteredClinics.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clinics Found</h3>
              <p className="text-gray-600 mb-4">
                No e-clinics found in your area. Try adjusting your search criteria or increasing the distance.
              </p>
              <Button onClick={getCurrentLocationAndClinics} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredClinics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => (
              <Card key={clinic.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  {clinic.cover_image && clinic.cover_image !== null ? (
                    <img
                      src={clinic.cover_image}
                      alt={clinic.name || 'Clinic'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {clinic.is_verified && (
                      <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant={clinic.is_active ? "default" : "secondary"} className="text-xs">
                      {clinic.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Clinic Info */}
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{clinic.name || 'Unnamed Clinic'}</h3>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{clinic.city || 'N/A'}, {clinic.state || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{clinic.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{clinic.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{clinic.consultation_duration || 15} min consultation</span>
                      </div>
                    </div>

                    {/* Distance Info */}
                    {clinic.distance !== Infinity && (
                      <div className="p-2 bg-blue-50 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Ruler className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-700">Distance</span>
                        </div>
                        <p className="text-sm text-blue-800">
                          {clinic.distanceText} away from your location
                        </p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClinic(clinic);
                          setIsModalOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No e-clinics found</h3>
            <p className="text-gray-600 mb-4">
              {loading ? 'Loading e-clinics...' : 'No e-clinics match your current filters or location.'}
            </p>
            {!loading && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Try adjusting your search filters or location settings.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCity('all');
                    setSelectedState('all');
                    setMaxDistance(50);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clinic Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedClinic?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClinic && (
            <div className="space-y-6">
              {/* Cover Image */}
              {selectedClinic.cover_image && (
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  <img 
                    src={selectedClinic.cover_image} 
                    alt={`${selectedClinic.name} cover`}
                    className="w-full h-full object-cover"
                  />
                  {selectedClinic.is_verified && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  )}
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>{selectedClinic.address}, {selectedClinic.city}, {selectedClinic.state}</span>
                    </div>
                    {selectedClinic.distance !== Infinity && (
                      <div className="flex items-center gap-2 text-blue-600 mt-1">
                        <Ruler className="w-4 h-4" />
                        <span>{selectedClinic.distanceText} away from your location</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {selectedClinic.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                      <p className="text-gray-600">{selectedClinic.description}</p>
                    </div>
                  )}

                  {/* Specialties */}
                  {selectedClinic.specialties && selectedClinic.specialties.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedClinic.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {selectedClinic.services && selectedClinic.services.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Services</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedClinic.services.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Facilities */}
                  {selectedClinic.facilities && selectedClinic.facilities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Facilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedClinic.facilities.map((facility, index) => (
                          <Badge key={index} variant="outline" className="text-sm bg-blue-50 text-blue-700">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Map Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Location on Map</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    {selectedClinic.latitude && selectedClinic.longitude ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MapPin className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-600 mb-2">Interactive Map</p>
                        <p className="text-sm text-gray-500">
                          Coordinates: {selectedClinic.latitude}, {selectedClinic.longitude}
                        </p>
                        <Button 
                          className="mt-3 bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#D1661F] hover:to-[#E67A4A]"
                          onClick={() => {
                            const url = `https://www.google.com/maps?q=${selectedClinic.latitude},${selectedClinic.longitude}`;
                            window.open(url, '_blank');
                          }}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Open in Google Maps
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-2" />
                        <p>Location coordinates not available</p>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      {selectedClinic.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{selectedClinic.phone}</span>
                        </div>
                      )}
                      {selectedClinic.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{selectedClinic.email}</span>
                        </div>
                      )}
                      {selectedClinic.website && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Globe className="w-4 h-4" />
                          <a href={selectedClinic.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1 bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#D1661F] hover:to-[#E67A4A]"
                  onClick={() => {
                    // Handle booking or contact action
                    console.log('Contact clinic:', selectedClinic.name);
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Clinic
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NearbyEClinics;
