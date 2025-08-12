import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  composition: string;
  dosage_form: string;
  strength: string;
  medication_type: string;
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
}

const MedicationManagement: React.FC = () => {
  const [medications, setMedications] = useState<GlobalMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<GlobalMedication | null>(null);
  const [deletingMedication, setDeletingMedication] = useState<GlobalMedication | null>(null);
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    generic_name: '',
    brand_name: '',
    composition: '',
    dosage_form: 'tablet',
    strength: '',
    medication_type: 'generic',
    therapeutic_class: '',
    indication: '',
    contraindications: '',
    side_effects: '',
    dosage_instructions: '',
    frequency_options: ['once_daily', 'twice_daily', 'thrice_daily'],
    timing_options: ['after_breakfast', 'after_lunch', 'after_dinner'],
    manufacturer: '',
    license_number: '',
    is_prescription_required: true,
    is_active: true,
    is_verified: false,
  });

  const dosageForms = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'capsule', label: 'Capsule' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'injection', label: 'Injection' },
    { value: 'cream', label: 'Cream' },
    { value: 'ointment', label: 'Ointment' },
    { value: 'drops', label: 'Drops' },
    { value: 'inhaler', label: 'Inhaler' },
    { value: 'suppository', label: 'Suppository' },
    { value: 'other', label: 'Other' },
  ];

  const medicationTypes = [
    { value: 'generic', label: 'Generic' },
    { value: 'branded', label: 'Branded' },
    { value: 'combination', label: 'Combination' },
  ];

  const frequencyOptions = [
    { value: 'once_daily', label: 'Once Daily' },
    { value: 'twice_daily', label: 'Twice Daily' },
    { value: 'thrice_daily', label: 'Thrice Daily' },
    { value: 'four_times_daily', label: 'Four Times Daily' },
    { value: 'sos', label: 'SOS (As Needed)' },
    { value: 'custom', label: 'Custom' },
  ];

  const timingOptions = [
    { value: 'before_breakfast', label: 'Before Breakfast' },
    { value: 'after_breakfast', label: 'After Breakfast' },
    { value: 'before_lunch', label: 'Before Lunch' },
    { value: 'after_lunch', label: 'After Lunch' },
    { value: 'before_dinner', label: 'Before Dinner' },
    { value: 'after_dinner', label: 'After Dinner' },
    { value: 'bedtime', label: 'Bedtime' },
    { value: 'empty_stomach', label: 'Empty Stomach' },
    { value: 'with_food', label: 'With Food' },
    { value: 'custom', label: 'Custom' },
  ];

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/eclinic/medications/');
      // Handle both success format and direct results format
      if (response.data.success && response.data.data) {
        setMedications(response.data.data);
      } else if (response.data.results) {
        setMedications(response.data.results);
      } else {
        setMedications([]);
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error);
      toast.error('Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMedications();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/eclinic/medications/search/?q=${encodeURIComponent(searchQuery)}`);
      // Handle both success format and direct results format
      if (response.data.success && response.data.data) {
        setMedications(response.data.data.medications);
      } else if (response.data.results) {
        setMedications(response.data.results);
      } else {
        setMedications([]);
      }
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
      composition: '',
      dosage_form: 'tablet',
      strength: '',
      medication_type: 'generic',
      therapeutic_class: '',
      indication: '',
      contraindications: '',
      side_effects: '',
      dosage_instructions: '',
      frequency_options: ['once_daily', 'twice_daily', 'thrice_daily'],
      timing_options: ['after_breakfast', 'after_lunch', 'after_dinner'],
      manufacturer: '',
      license_number: '',
      is_prescription_required: true,
      is_active: true,
      is_verified: false,
    });
  };

  const handleAddMedication = async () => {
    try {
      const response = await api.post('/api/eclinic/medications/', formData);
      if (response.data.success) {
        toast.success('Medication added successfully');
        setShowAddForm(false);
        resetForm();
        fetchMedications();
      }
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
      if (response.data.success) {
        toast.success('Medication updated successfully');
        setEditingMedication(null);
        resetForm();
        fetchMedications();
      }
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
      fetchMedications();
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
      composition: medication.composition,
      dosage_form: medication.dosage_form,
      strength: medication.strength,
      medication_type: medication.medication_type,
      therapeutic_class: medication.therapeutic_class,
      indication: medication.indication,
      contraindications: medication.contraindications,
      side_effects: medication.side_effects,
      dosage_instructions: medication.dosage_instructions,
      frequency_options: medication.frequency_options,
      timing_options: medication.timing_options,
      manufacturer: medication.manufacturer,
      license_number: medication.license_number,
      is_prescription_required: medication.is_prescription_required,
      is_active: medication.is_active,
      is_verified: medication.is_verified,
    });
  };

  const filteredMedications = medications.filter(medication =>
    medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medication.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medication.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Button variant="outline" onClick={() => { setSearchQuery(''); fetchMedications(); }}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
                
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

                <div>
                  <Label>Strength</Label>
                  <Input
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g., 500mg, 10mg/ml"
                  />
                </div>

                <div>
                  <Label>Dosage Form</Label>
                  <Select value={formData.dosage_form} onValueChange={(value) => setFormData({ ...formData, dosage_form: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dosageForms.map(form => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Medication Type</Label>
                  <Select value={formData.medication_type} onValueChange={(value) => setFormData({ ...formData, medication_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {medicationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Therapeutic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Therapeutic Information</h3>
                
                <div>
                  <Label>Therapeutic Class</Label>
                  <Input
                    value={formData.therapeutic_class}
                    onChange={(e) => setFormData({ ...formData, therapeutic_class: e.target.value })}
                    placeholder="e.g., Analgesic, Antibiotic"
                  />
                </div>

                <div>
                  <Label>Manufacturer</Label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g., Pfizer, GlaxoSmithKline"
                  />
                </div>

                <div>
                  <Label>License Number</Label>
                  <Input
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="e.g., DCGI-12345"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_prescription_required"
                    checked={formData.is_prescription_required}
                    onChange={(e) => setFormData({ ...formData, is_prescription_required: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_prescription_required">Prescription Required</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_verified">Verified</Label>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Detailed Information</h3>
              
              <div>
                <Label>Composition</Label>
                <Textarea
                  value={formData.composition}
                  onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                  placeholder="Active ingredients and composition"
                  rows={3}
                />
              </div>

              <div>
                <Label>Indication</Label>
                <Textarea
                  value={formData.indication}
                  onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                  placeholder="What this medication is used for"
                  rows={3}
                />
              </div>

              <div>
                <Label>Contraindications</Label>
                <Textarea
                  value={formData.contraindications}
                  onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
                  placeholder="When this medication should not be used"
                  rows={3}
                />
              </div>

              <div>
                <Label>Side Effects</Label>
                <Textarea
                  value={formData.side_effects}
                  onChange={(e) => setFormData({ ...formData, side_effects: e.target.value })}
                  placeholder="Common side effects"
                  rows={3}
                />
              </div>

              <div>
                <Label>Dosage Instructions</Label>
                <Textarea
                  value={formData.dosage_instructions}
                  onChange={(e) => setFormData({ ...formData, dosage_instructions: e.target.value })}
                  placeholder="General dosage instructions"
                  rows={3}
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
          <CardTitle>Medications ({filteredMedications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredMedications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medications found
            </div>
          ) : (
                         <div className="space-y-4">
               {filteredMedications.map((medication) => (
                 <div key={medication.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                   <div className="flex justify-between items-start">
                     <div className="flex-1">
                       {/* Header with name and badges */}
                       <div className="flex items-center gap-3 mb-4">
                         <div className="flex items-center gap-2">
                           <Pill className="w-5 h-5 text-blue-600" />
                           <h3 className="font-bold text-xl text-gray-900">{medication.name}</h3>
                         </div>
                         <div className="flex gap-2">
                           {medication.is_verified && (
                             <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                               <CheckCircle className="w-3 h-3 mr-1" />
                               Verified
                             </Badge>
                           )}
                           {!medication.is_active && (
                             <Badge variant="destructive">Inactive</Badge>
                           )}
                           {medication.is_prescription_required && (
                             <Badge variant="outline" className="border-orange-200 text-orange-700">
                               Prescription Required
                             </Badge>
                           )}
                         </div>
                       </div>
                       
                       {/* Main medication details */}
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                         <div className="bg-gray-50 p-3 rounded-lg">
                           <div className="text-sm font-medium text-gray-500 mb-1">Generic Name</div>
                           <div className="font-semibold">{medication.generic_name || 'N/A'}</div>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-lg">
                           <div className="text-sm font-medium text-gray-500 mb-1">Brand Name</div>
                           <div className="font-semibold">{medication.brand_name || 'N/A'}</div>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-lg">
                           <div className="text-sm font-medium text-gray-500 mb-1">Strength</div>
                           <div className="font-semibold">{medication.strength || 'N/A'}</div>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-lg">
                           <div className="text-sm font-medium text-gray-500 mb-1">Dosage Form</div>
                           <div className="font-semibold">{medication.dosage_form_display}</div>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-lg">
                           <div className="text-sm font-medium text-gray-500 mb-1">Type</div>
                           <div className="font-semibold">{medication.medication_type_display}</div>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-lg">
                           <div className="text-sm font-medium text-gray-500 mb-1">Therapeutic Class</div>
                           <div className="font-semibold">{medication.therapeutic_class || 'N/A'}</div>
                         </div>
                       </div>

                       {/* Additional details */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         {medication.composition && (
                           <div className="bg-blue-50 p-3 rounded-lg">
                             <div className="text-sm font-medium text-blue-600 mb-1">Composition</div>
                             <div className="text-sm">{medication.composition}</div>
                           </div>
                         )}
                         {medication.indication && (
                           <div className="bg-green-50 p-3 rounded-lg">
                             <div className="text-sm font-medium text-green-600 mb-1">Indication</div>
                             <div className="text-sm">{medication.indication}</div>
                           </div>
                         )}
                       </div>

                       {/* Manufacturer and metadata */}
                       <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                         <div className="flex items-center gap-4">
                           <span><strong>Manufacturer:</strong> {medication.manufacturer || 'N/A'}</span>
                           <span><strong>License:</strong> {medication.license_number || 'N/A'}</span>
                           <span><strong>Created by:</strong> {medication.created_by_name}</span>
                         </div>
                         <div className="text-xs">
                           Created: {new Date(medication.created_at).toLocaleDateString()}
                         </div>
                       </div>
                     </div>

                     {/* Action buttons */}
                     <div className="flex gap-2 ml-6">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => startEdit(medication)}
                         className="hover:bg-blue-50 hover:border-blue-200"
                       >
                         <Edit className="w-4 h-4 mr-1" />
                         Edit
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setDeletingMedication(medication)}
                         className="hover:bg-red-50 hover:border-red-200 text-red-600"
                       >
                         <Trash2 className="w-4 h-4 mr-1" />
                         Delete
                       </Button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
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
