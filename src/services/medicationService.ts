import { api } from '@/lib/utils';

export interface MedicationSearchResult {
  id: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  strength: string;
  dosage_form: string;
  source: 'local_database' | 'fda_api' | 'inventory' | 'previously_prescribed' | 'existing_inventory' | 'newly_created';
  therapeutic_class?: string;
  is_verified: boolean;
  medication_type?: string;
  composition?: string;
  indication?: string;
  manufacturer?: string;
  stock?: number;
  unit?: string;
  is_low_stock?: boolean;
  expiry_date?: string;
  supplier?: string;
  contraindications?: string;
  side_effects?: string;
  dosage_instructions?: string;
  frequency_options?: string[];
  timing_options?: string[];
  is_prescription_required?: boolean;
  is_active?: boolean;
}

export interface MedicationSearchResponse {
  success: boolean;
  data: {
    medications: MedicationSearchResult[];
    total_found: number;
    query: string;
  };
  message: string;
  timestamp: string;
}

export interface AutoCreateMedicationRequest {
  name: string;
  composition?: string;
  dosage_form?: string;
}

export const medicationService = {
  // Search medications using local database only (FDA database removed)
  async searchMedications(query: string, limit: number = 20, includeFDA: boolean = false): Promise<MedicationSearchResponse> {
    const response = await api.get('/api/eclinic/medications/', {
      params: { 
        search: query, 
        limit,
        page: 1
      }
    });
    
    // Transform the response to match the expected format
    const medications = response.data.data || response.data || [];
    const transformedMedications: MedicationSearchResult[] = medications.map((med: any) => ({
      id: med.id.toString(),
      name: med.name,
      generic_name: med.generic_name,
      brand_name: med.brand_name,
      strength: med.strength,
      dosage_form: med.dosage_form,
      source: 'local_database',
      therapeutic_class: med.therapeutic_class,
      is_verified: med.is_verified,
      medication_type: med.medication_type,
      composition: med.composition,
      indication: med.indication,
      manufacturer: med.manufacturer,
      contraindications: med.contraindications,
      side_effects: med.side_effects,
      dosage_instructions: med.dosage_instructions,
      frequency_options: med.frequency_options,
      timing_options: med.timing_options,
      is_prescription_required: med.is_prescription_required,
      is_active: med.is_active,
      stock: undefined,
      unit: undefined,
      is_low_stock: false,
      expiry_date: undefined,
      supplier: undefined
    }));

    return {
      success: true,
      data: {
        medications: transformedMedications,
        total_found: transformedMedications.length,
        query: query
      },
      message: 'Medications retrieved successfully',
      timestamp: new Date().toISOString()
    };
  },

  // Search medications in clinic inventory (for authenticated users)
  async searchClinicMedications(clinicId: string, query: string, limit: number = 20): Promise<MedicationSearchResponse> {
    const response = await api.get(`/api/eclinic/${clinicId}/inventory/medications/search/`, {
      params: { q: query, limit }
    });
    return response.data;
  },

  // Auto-create medication in global catalog
  async autoCreateMedication(medication: AutoCreateMedicationRequest): Promise<MedicationSearchResponse> {
    const response = await api.post(`/api/eclinic/medications/auto-create/`, medication);
    
    console.log('🔍 Auto-create medication API response:', response.data);
    
    // Transform the response to match the expected format
    // API returns: { success: true, data: { medication: {...}, source: "auto_created" } }
    const newMedication = response.data.data.medication;
    
    console.log('🔍 Extracted medication data:', newMedication);
    const transformedMedication: MedicationSearchResult = {
      id: newMedication.id.toString(),
      name: newMedication.name,
      generic_name: newMedication.generic_name,
      brand_name: newMedication.brand_name,
      strength: newMedication.strength,
      dosage_form: newMedication.dosage_form,
      source: 'newly_created',
      therapeutic_class: newMedication.therapeutic_class,
      is_verified: newMedication.is_verified,
      medication_type: newMedication.medication_type,
      composition: newMedication.composition,
      indication: newMedication.indication,
      manufacturer: newMedication.manufacturer,
      contraindications: newMedication.contraindications,
      side_effects: newMedication.side_effects,
      dosage_instructions: newMedication.dosage_instructions,
      frequency_options: newMedication.frequency_options,
      timing_options: newMedication.timing_options,
      is_prescription_required: newMedication.is_prescription_required,
      is_active: newMedication.is_active,
      stock: undefined,
      unit: undefined,
      is_low_stock: false,
      expiry_date: undefined,
      supplier: undefined
    };

    return {
      success: true,
      data: {
        medications: [transformedMedication],
        total_found: 1,
        query: medication.name
      },
      message: 'Medication created successfully',
      timestamp: new Date().toISOString()
    };
  }
};
