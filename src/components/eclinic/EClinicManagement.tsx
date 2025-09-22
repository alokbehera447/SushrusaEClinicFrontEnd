import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Edit, 
  Eye, 
  RefreshCw, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { EClinic } from '@/lib/api';
import { superAdminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import EClinicProfileView from './EClinicProfileView';
import EClinicEditForm from './EClinicEditForm';

interface EClinicManagementProps {
  clinicId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

type ViewMode = 'view' | 'edit';

const EClinicManagement: React.FC<EClinicManagementProps> = ({ 
  clinicId, 
  onBack,
  showBackButton = true 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [clinic, setClinic] = useState<EClinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clinicId) {
      fetchClinicData();
    }
  }, [clinicId]);

  const fetchClinicData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching clinic data for ID:', clinicId);
      const clinicData = await superAdminApi.getEClinic(clinicId);
      console.log('Fetched clinic data:', clinicData);
      setClinic(clinicData);
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      console.error('Error details:', error);
      setError('Failed to load clinic data');
      toast.error('Failed to load clinic data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setViewMode('edit');
  };

  const handleSave = (updatedClinic: EClinic) => {
    setClinic(updatedClinic);
    setViewMode('view');
    toast.success('Clinic profile updated successfully!');
  };

  const handleCancel = () => {
    setViewMode('view');
  };

  const handleRefresh = () => {
    fetchClinicData();
    toast.success('Clinic data refreshed');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#E17726]" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Loading Clinic Profile</h1>
                  <p className="text-sm text-gray-600">Please wait while we fetch the clinic data...</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Error Loading Clinic</h1>
                  <p className="text-sm text-gray-600">Unable to load clinic profile</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {showBackButton && onBack && (
                  <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button onClick={handleRefresh} className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error Loading Clinic Profile</AlertTitle>
          <AlertDescription className="text-red-700">
            {error || 'Clinic profile not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && onBack && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-[#E17726]" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {viewMode === 'edit' ? 'Edit' : 'View'} E-Clinic Profile
                  </h1>
                  <p className="text-sm text-gray-600">
                    {clinic.name} • ID: {clinic.id}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                className={`${
                  clinic.is_active && clinic.is_verified 
                    ? 'bg-green-100 text-green-800' 
                    : clinic.is_active 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {clinic.is_active && clinic.is_verified ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active & Verified
                  </>
                ) : clinic.is_active ? (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Active (Pending Verification)
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      {viewMode === 'view' ? (
        <EClinicProfileView 
          clinicId={clinicId}
          onEdit={handleEdit}
          isEditable={true}
        />
      ) : (
        <EClinicEditForm 
          clinicId={clinicId}
          onSave={handleSave}
          onCancel={handleCancel}
          initialData={clinic}
        />
      )}
    </div>
  );
};

export default EClinicManagement;
