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
  // Search medications using the public FDA API endpoint
  async searchMedications(query: string, limit: number = 20, includeFDA: boolean = true): Promise<MedicationSearchResponse> {
    const response = await api.get('/api/eclinic/medications/public-search/', {
      params: { 
        q: query, 
        limit,
        include_fda: includeFDA,
        source: 'all'
      }
    });
    return response.data;
  },

  // Search medications in clinic inventory (for authenticated users)
  async searchClinicMedications(clinicId: string, query: string, limit: number = 20): Promise<MedicationSearchResponse> {
    const response = await api.get(`/api/eclinic/${clinicId}/inventory/medications/search/`, {
      params: { q: query, limit }
    });
    return response.data;
  },

  // Auto-create medication in inventory
  async autoCreateMedication(clinicId: string, medication: AutoCreateMedicationRequest): Promise<MedicationSearchResponse> {
    const response = await api.post(`/api/eclinic/${clinicId}/inventory/medications/auto-create/`, medication);
    return response.data;
  }
};
