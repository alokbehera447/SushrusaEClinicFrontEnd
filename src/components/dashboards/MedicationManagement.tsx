import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Download,
  Pill,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/utils';

interface GlobalMedication {
  id: number;
  name: string;
  generic_name: string;
  brand_name: string;
  composition: string;
  dosage_form: string;
  dosage_form_display: string;
  strength: string;
  medication_type: string;
  medication_type_display: string;
  therapeutic_class: string;
  indication: string;
  contraindications: string;
  side_effects: string;
  dosage_instructions: string;
  frequency_options: string[];
  timing_options: string[];
  manufacturer: string;
  license_number: string;
  is_prescription_required: boolean;
  is_active: boolean;
  is_verified: boolean;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

interface MedicationFormData {
  name: string;
  generic_name: string;
  brand_name: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  total_pages: number;
}

const MedicationManagement: React.FC = () => {
  const [medications, setMedications] = useState<GlobalMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<GlobalMedication | null>(null);
  const [deletingMedication, setDeletingMedication] = useState<GlobalMedication | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    page_size: 20,
    total_pages: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    generic_name: '',
    brand_name: '',
  });



  useEffect(() => {
    fetchMedications(1);
  }, []);

  const fetchMedications = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/eclinic/medications/?page=${page}`);
      
      // Handle the new paginated response format
      if (response.data.success && response.data.data) {
        setMedications(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else if (response.data.results) {
        // Fallback for old format
        setMedications(response.data.results);
      } else {
        setMedications([]);
      }
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
      toast.error('Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMedications(1);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/eclinic/medications/?search=${encodeURIComponent(searchQuery)}`);
      
      // Handle the new paginated response format
      if (response.data.success && response.data.data) {
        setMedications(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else if (response.data.results) {
        // Fallback for old format
        setMedications(response.data.results);
      } else {
        setMedications([]);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to search medications:', error);
      toast.error('Failed to search medications');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      generic_name: '',
      brand_name: '',
    });
  };

  const handleAddMedication = async () => {
    try {
      const response = await api.post('/api/eclinic/medications/', formData);
      console.log('Add medication response:', response);
      
      // If we reach here without an error, the request was successful
      toast.success('Medication added successfully');
      setShowAddForm(false);
      resetForm();
      fetchMedications(1);
      
    } catch (error: any) {
      console.error('Failed to add medication:', error);
      const message = error.response?.data?.error?.message || 'Failed to add medication';
      toast.error(message);
    }
  };

  const handleEditMedication = async () => {
    if (!editingMedication) return;

    try {
      const response = await api.put(`/api/eclinic/medications/${editingMedication.id}/`, formData);
      console.log('Edit medication response:', response);
      
      // If we reach here without an error, the request was successful
      toast.success('Medication updated successfully');
      setEditingMedication(null);
      resetForm();
      fetchMedications(currentPage);
      
    } catch (error: any) {
      console.error('Failed to update medication:', error);
      const message = error.response?.data?.error?.message || 'Failed to update medication';
      toast.error(message);
    }
  };

  const handleDeleteMedication = async () => {
    if (!deletingMedication) return;

    try {
      await api.delete(`/api/eclinic/medications/${deletingMedication.id}/`);
      toast.success('Medication deleted successfully');
      setDeletingMedication(null);
      fetchMedications(currentPage);
    } catch (error) {
      console.error('Failed to delete medication:', error);
      toast.error('Failed to delete medication');
    }
  };

  const startEdit = (medication: GlobalMedication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      generic_name: medication.generic_name,
      brand_name: medication.brand_name,
    });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (searchQuery.trim()) {
      // For search, we need to implement search pagination
      handleSearchPage(page);
    } else {
      fetchMedications(page);
    }
  };

  const handleSearchPage = async (page: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/eclinic/medications/?search=${encodeURIComponent(searchQuery)}&page=${page}`);
      
      if (response.data.success && response.data.data) {
        setMedications(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to search medications:', error);
      toast.error('Failed to search medications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medication Management</h1>
          <p className="text-muted-foreground">Manage global medication catalog</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Medication
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search medications by name, generic name, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
            <Button variant="outline" onClick={() => { setSearchQuery(''); fetchMedications(1); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingMedication) && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              {editingMedication ? 'Edit Medication' : 'Add New Medication'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Medication Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Paracetamol"
                />
              </div>

              <div>
                <Label>Generic Name</Label>
                <Input
                  value={formData.generic_name}
                  onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                  placeholder="e.g., Acetaminophen"
                />
              </div>

              <div>
                <Label>Brand Name</Label>
                <Input
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  placeholder="e.g., Crocin"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMedication(null);
                  resetForm();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={editingMedication ? handleEditMedication : handleAddMedication}
                disabled={!formData.name.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingMedication ? 'Update' : 'Add'} Medication
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Medications ({pagination.count} total)
              {searchQuery && ` - Showing search results for "${searchQuery}"`}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {pagination.total_pages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : medications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medications found
            </div>
          ) : (
            <>
              {/* Compact Table-like Layout */}
              <div className="space-y-1">
                {/* Header - Hidden on mobile */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
                  <div className="col-span-3">Medication Name</div>
                  <div className="col-span-2">Generic Name</div>
                  <div className="col-span-2">Brand Name</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Created By</div>
                  <div className="col-span-1">Actions</div>
                </div>
                
                {/* Medication Rows */}
                {medications.map((medication) => (
                  <div key={medication.id}>
                    {/* Desktop Layout */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors items-center">
                      {/* Medication Name with Icon */}
                      <div className="col-span-3 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate" title={medication.name}>
                            {medication.name}
                          </div>
                          {medication.strength && (
                            <div className="text-xs text-gray-500 truncate">
                              {medication.strength}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Generic Name */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-700 truncate" title={medication.generic_name || 'N/A'}>
                          {medication.generic_name || 'N/A'}
                        </div>
                      </div>
                      
                      {/* Brand Name */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-700 truncate" title={medication.brand_name || 'N/A'}>
                          {medication.brand_name || 'N/A'}
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="col-span-2 flex gap-1 flex-wrap">
                        {medication.is_verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <CheckCircle className="w-2 h-2 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {!medication.is_active && (
                          <Badge variant="destructive" className="text-xs">Inactive</Badge>
                        )}
                        {medication.is_prescription_required && (
                          <Badge variant="outline" className="border-orange-200 text-orange-700 text-xs">
                            Rx
                          </Badge>
                        )}
                      </div>
                      
                      {/* Created By */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600 truncate" title={medication.created_by_name}>
                          {medication.created_by_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(medication.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-1 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(medication)}
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                          title="Edit medication"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingMedication(medication)}
                          className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                          title="Delete medication"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Pill className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {medication.name}
                            </div>
                            {medication.strength && (
                              <div className="text-xs text-gray-500">
                                {medication.strength}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(medication)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingMedication(medication)}
                            className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        {medication.generic_name && (
                          <div><span className="text-gray-500">Generic:</span> {medication.generic_name}</div>
                        )}
                        {medication.brand_name && (
                          <div><span className="text-gray-500">Brand:</span> {medication.brand_name}</div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-1 flex-wrap">
                          {medication.is_verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                              <CheckCircle className="w-2 h-2 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {!medication.is_active && (
                            <Badge variant="destructive" className="text-xs">Inactive</Badge>
                          )}
                          {medication.is_prescription_required && (
                            <Badge variant="outline" className="border-orange-200 text-orange-700 text-xs">
                              Rx
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(medication.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {pagination.total_pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.previous || loading}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.total_pages - 2) {
                        pageNum = pagination.total_pages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.next || loading}
                  >
                    Next
                  </Button>
                  
                  <div className="ml-4 text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pagination.page_size) + 1} to{' '}
                    {Math.min(currentPage * pagination.page_size, pagination.count)} of{' '}
                    {pagination.count} medications
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deletingMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Confirm Deletion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Are you sure you want to delete <strong>{deletingMedication.name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setDeletingMedication(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteMedication}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MedicationManagement;
