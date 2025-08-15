import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { 
  patientService, 
  type PatientProfile, 
  type PatientSearchParams 
} from '@/services/patientService';
import { toast } from '@/hooks/use-toast';

interface PatientSearchProps {
  onPatientSelect?: (patient: PatientProfile) => void;
  showActions?: boolean;
  showBookConsultation?: boolean;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({ 
  onPatientSelect,
  showActions = true,
  showBookConsultation = false
}) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<PatientSearchParams>({
    query: '',
    gender: '',
    blood_group: '',
    age_min: undefined,
    age_max: undefined,
    city: '',
    state: '',
    page: 1,
    page_size: 20
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (searchParams.query || searchParams.gender || searchParams.blood_group || 
        searchParams.age_min || searchParams.age_max || searchParams.city || searchParams.state) {
      searchPatients();
    }
  }, [searchParams]);

  const searchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.searchPatients(searchParams);
      
      console.log('Patient search response:', response);
      
      // Handle the paginated response structure
      let patientData: PatientProfile[] = [];
      
      console.log('🔍 Processing response structure:', {
        hasData: !!response.data,
        hasResults: !!response.results,
        resultsDataType: typeof response.results,
        resultsData: response.results
      });
      
      // Check if response has results with nested data structure
      if (response.results && response.results.data && Array.isArray(response.results.data)) {
        patientData = response.results.data;
        console.log('✅ Found data in response.results.data');
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Standard paginated response
        patientData = response.data.results;
        console.log('✅ Found data in response.data.results');
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array response
        patientData = response.data;
        console.log('✅ Found data in response.data');
      } else if (response.results && Array.isArray(response.results)) {
        // Direct results array
        patientData = response.results;
        console.log('✅ Found data in response.results');
      } else if (Array.isArray(response)) {
        // Response is directly an array
        patientData = response;
        console.log('✅ Found data in response directly');
      }
      
      console.log('Extracted patient data:', patientData);
      
      setPatients(patientData);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast({
        title: "Error",
        description: "Failed to search patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPatients();
  };

  const handlePatientClick = (patient: PatientProfile) => {
    if (onPatientSelect) {
      onPatientSelect(patient);
    }
  };

  const clearFilters = () => {
    setSearchParams({
      query: '',
      gender: '',
      blood_group: '',
      age_min: undefined,
      age_max: undefined,
      city: '',
      state: '',
      page: 1,
      page_size: 20
    });
  };

  const handleBookConsultation = (patient: PatientProfile) => {
    // Navigate to consultation creation page with patient data
    navigate('/admin/consultations/new', {
      state: {
        selectedPatient: {
          id: patient.id,
          user: patient.user,
          user_name: patient.user_name,
          user_phone: patient.user_phone,
          user_email: patient.user_email
        }
      }
    });
  };

  const getGenderColor = (gender: string) => {
    const colors: Record<string, string> = {
      male: 'bg-blue-100 text-blue-800',
      female: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[gender] || colors.other;
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-50 text-red-700',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-50 text-blue-700',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-50 text-purple-700',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-50 text-green-700'
    };
    return colors[bloodGroup] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Patient Search
          </CardTitle>
          <CardDescription>
            Search and filter patients by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Basic Search */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name, phone, or email..."
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={searchParams.gender} 
                    onValueChange={(value) => setSearchParams(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Select 
                    value={searchParams.blood_group} 
                    onValueChange={(value) => setSearchParams(prev => ({ ...prev, blood_group: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All blood groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All blood groups</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="age_min">Min Age</Label>
                  <Input
                    id="age_min"
                    type="number"
                    placeholder="Min age"
                    value={searchParams.age_min || ''}
                    onChange={(e) => setSearchParams(prev => ({ 
                      ...prev, 
                      age_min: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="age_max">Max Age</Label>
                  <Input
                    id="age_max"
                    type="number"
                    placeholder="Max age"
                    value={searchParams.age_max || ''}
                    onChange={(e) => setSearchParams(prev => ({ 
                      ...prev, 
                      age_max: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={searchParams.city}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={searchParams.state}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button type="submit" className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Search Button for Basic Search */}
            {!showFilters && (
              <div className="flex justify-end">
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            {loading ? 'Searching...' : `${patients.length} patients found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : patients.length > 0 ? (
            <div className="grid gap-4">
              {patients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold truncate">{patient.user_name}</h3>
                            <Badge className={getGenderColor(patient.gender)}>
                              {patient.gender}
                            </Badge>
                            {patient.blood_group && (
                              <Badge className={getBloodGroupColor(patient.blood_group)}>
                                {patient.blood_group}
                              </Badge>
                            )}
                            <Badge variant={patient.is_active ? "default" : "secondary"}>
                              {patient.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{patient.user_phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{patient.user_email || 'No email'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{patient.city}, {patient.state}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Age: {patient.age}</span>
                            <span>ID: {patient.user}</span>
                            {patient.chronic_conditions.length > 0 && (
                              <span>Conditions: {patient.chronic_conditions.length}</span>
                            )}
                            {patient.total_consultations !== undefined && (
                              <span>Consultations: {patient.total_consultations}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {showActions && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePatientClick(patient)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {showBookConsultation && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleBookConsultation(patient)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Book Consultation
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchParams.query || searchParams.gender || searchParams.blood_group || 
               searchParams.age_min || searchParams.age_max || searchParams.city || searchParams.state ? (
                <div>
                  <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>No patients found matching your search criteria</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div>
                  <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p>Enter search criteria to find patients</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
