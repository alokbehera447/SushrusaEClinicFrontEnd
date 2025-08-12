import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Map,
  List,
  RefreshCw,
  Location,
  Distance,
  Rating
} from 'lucide-react';
import { toast } from 'sonner';
import { superAdminApi, EClinic } from '@/lib/api';

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
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [showMap, setShowMap] = useState(false);

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
      const response = await superAdminApi.getEClinics({
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
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast.error('Failed to fetch nearby clinics');
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
    
    const matchesCity = !selectedCity || clinic.city === selectedCity;
    const matchesState = !selectedState || clinic.state === selectedState;

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
                <SelectItem value="">All Cities</SelectItem>
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
                <SelectItem value="">All States</SelectItem>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => (
              <Card 
                key={clinic.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onClinicSelect?.(clinic)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {clinic.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{clinic.city}, {clinic.state}</span>
                      </div>
                      {clinic.distance !== Infinity && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Distance className="w-4 h-4" />
                          <span>{clinic.distanceText} away</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {clinic.is_verified && (
                        <CheckCircle className="w-5 h-5 text-green-600" title="Verified" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {clinic.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {clinic.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{clinic.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Services */}
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Online consultations available</span>
                    </div>
                    {clinic.accepts_online_consultations && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Accepts online consultations</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-sm">
                    {clinic.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{clinic.phone}</span>
                      </div>
                    )}
                    {clinic.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{clinic.email}</span>
                      </div>
                    )}
                    {clinic.website && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Globe className="w-4 h-4" />
                        <span>Visit Website</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClinicSelect?.(clinic);
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyEClinics;
