import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Pill, 
  ExternalLink, 
  Database, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import MedicationSearch from '@/components/MedicationSearch';
import { useNavigate } from 'react-router-dom';

const MedicationSearchDemo: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMedications, setSelectedMedications] = useState<any[]>([]);

  const handleMedicationSelect = (medication: any) => {
    setSelectedMedications(prev => [...prev, medication]);
  };

  const removeMedication = (index: number) => {
    setSelectedMedications(prev => prev.filter((_, i) => i !== index));
  };

  const getSourceIcon = (source: string) => {
    return source === 'fda_api' ? (
      <ExternalLink className="w-4 h-4 text-blue-500" />
    ) : (
      <Database className="w-4 h-4 text-green-500" />
    );
  };

  const getVerificationIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-500" />
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medication Search Demo</h1>
            <p className="text-gray-600">
              Test the FDA API integration with 50,000+ medications
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600">
            <ExternalLink className="w-3 h-3 mr-1" />
            FDA Database Enabled
          </Badge>
        </div>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 FDA API Integration Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Pill className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">50,000+ Medications</h3>
              <p className="text-sm text-gray-600">Instant access to FDA database</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Government Verified</h3>
              <p className="text-sm text-gray-600">FDA-approved data</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold">Real-time Search</h3>
              <p className="text-sm text-gray-600">Always up-to-date information</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5" />
            Search Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Try searching for common medications like: <strong>aspirin</strong>, <strong>ibuprofen</strong>, <strong>acetaminophen</strong>, <strong>amoxicillin</strong>, or <strong>metformin</strong>
              </p>
              <MedicationSearch
                onMedicationSelect={handleMedicationSelect}
                placeholder="Search for medications (e.g., aspirin, ibuprofen, amoxicillin)..."
                includeFDA={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Medications */}
      {selectedMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Medications ({selectedMedications.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMedications([])}
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedMedications.map((medication, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                        {getVerificationIcon(medication.is_verified)}
                        {getSourceIcon(medication.source)}
                        <Badge variant="outline" className="text-xs">
                          {medication.source === 'fda_api' ? 'FDA' : 'Local'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {medication.generic_name && medication.generic_name !== medication.name && (
                          <div><strong>Generic:</strong> {medication.generic_name}</div>
                        )}
                        {medication.brand_name && medication.brand_name !== medication.name && (
                          <div><strong>Brand:</strong> {medication.brand_name}</div>
                        )}
                        {medication.strength && (
                          <div><strong>Strength:</strong> {medication.strength}</div>
                        )}
                        {medication.dosage_form && (
                          <div><strong>Form:</strong> {medication.dosage_form}</div>
                        )}
                        {medication.manufacturer && (
                          <div><strong>Manufacturer:</strong> {medication.manufacturer}</div>
                        )}
                        {medication.therapeutic_class && (
                          <div><strong>Class:</strong> {medication.therapeutic_class}</div>
                        )}
                      </div>
                      
                      {medication.indication && (
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>Indication:</strong> {medication.indication.substring(0, 150)}...
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-700 ml-4"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <strong>Search:</strong> Type any medication name in the search box above
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <strong>Select:</strong> Click on a medication from the dropdown results
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <strong>Review:</strong> View the selected medication details below
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <strong>Remove:</strong> Click "Remove" to delete medications you don't want
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Endpoint:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/api/eclinic/medications/search/</code></div>
                            <div><strong>Parameters:</strong> <code className="bg-gray-100 px-2 py-1 rounded">q=medication_name&include_fda=false&limit=20</code></div>
            <div><strong>Data Source:</strong> Local Database Only</div>
            <div><strong>Total Medications:</strong> Local medication inventory</div>
            <div><strong>Update Frequency:</strong> Manual updates by admin</div>
            <div><strong>Cost:</strong> Free (local database)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationSearchDemo;
