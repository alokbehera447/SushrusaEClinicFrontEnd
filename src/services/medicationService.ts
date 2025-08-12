import { api } from '@/lib/utils';

export interface MedicationSearchResult {
  id: string;
  name: string;
  strength: string;
  form: string;
  source: 'inventory' | 'previously_prescribed' | 'existing_inventory' | 'newly_created';
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
  // Search medications in inventory and previously prescribed
  async searchMedications(clinicId: string, query: string, limit: number = 10): Promise<MedicationSearchResponse> {
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
