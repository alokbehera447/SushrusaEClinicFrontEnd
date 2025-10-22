import { api } from '@/lib/api';

export interface InvestigationCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface InvestigationTest {
  id: number;
  category: InvestigationCategory;
  category_id: number;
  name: string;
  code: string;
  description: string;
  normal_range: string;
  unit: string;
  is_fasting_required: boolean;
  preparation_instructions: string;
  estimated_cost: number;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionInvestigation {
  id: number;
  prescription: number;
  test: InvestigationTest;
  test_id: number;
  priority: 'routine' | 'urgent' | 'emergency';
  special_instructions: string;
  notes: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface InvestigationListResponse {
  categories: InvestigationCategory[];
  tests: InvestigationTest[];
}

export interface AddInvestigationRequest {
  prescription_id: number;
  tests: {
    test_id: number;
    priority: 'routine' | 'urgent' | 'emergency';
    special_instructions?: string;
    notes?: string;
  }[];
}

export interface RemoveInvestigationRequest {
  prescription_id: number;
  test_ids: number[];
}

class InvestigationService {
  private baseUrl = '/api/prescriptions';

  // Get all investigation categories and tests
  async getInvestigationList(): Promise<InvestigationListResponse> {
    const response = await api.get(`${this.baseUrl}/investigations/`);
    return response.data.data;
  }

  // Get investigation categories only
  async getCategories(): Promise<InvestigationCategory[]> {
    const response = await api.get(`${this.baseUrl}/investigations/categories/`);
    return response.data.data;
  }

  // Get investigation tests only
  async getTests(): Promise<InvestigationTest[]> {
    const response = await api.get(`${this.baseUrl}/investigations/tests/`);
    return response.data.data;
  }

  // Get investigations for a specific prescription
  async getPrescriptionInvestigations(prescriptionId: number): Promise<PrescriptionInvestigation[]> {
    const response = await api.get(`${this.baseUrl}/investigations/prescription/?prescription_id=${prescriptionId}`);
    console.log('getPrescriptionInvestigations API response:', response.data);
    // Handle paginated response - investigations are in the 'results' array
    if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    // Fallback for other response structures
    return response.data.data || response.data || [];
  }

  // Add investigations to a prescription
  async addInvestigationsToPrescription(data: AddInvestigationRequest): Promise<PrescriptionInvestigation[]> {
    const response = await api.post(`${this.baseUrl}/investigations/prescription/`, data);
    console.log('addInvestigationsToPrescription API response:', response.data);
    // Handle paginated response - investigations are in the 'results' array
    if (response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    // Fallback for other response structures
    return response.data.data || response.data || [];
  }

  // Remove investigations from a prescription
  async removeInvestigationsFromPrescription(data: RemoveInvestigationRequest): Promise<void> {
    await api.delete(`${this.baseUrl}/investigations/prescription/remove/`, { data });
  }

  // Update a specific investigation
  async updateInvestigation(id: number, data: Partial<PrescriptionInvestigation>): Promise<PrescriptionInvestigation> {
    const response = await api.patch(`${this.baseUrl}/investigations/prescription/${id}/`, data);
    return response.data.data;
  }

  // Delete a specific investigation
  async deleteInvestigation(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/investigations/prescription/${id}/`);
  }

  // Auto-create investigation test if it doesn't exist
  async autoCreateTest(testData: { name: string; category_id?: number }): Promise<{
    success: boolean;
    data: {
      test: InvestigationTest;
      source: 'existing' | 'newly_created';
    };
    message: string;
  }> {
    const response = await api.post(`${this.baseUrl}/investigations/auto-create/`, testData);
    return response.data;
  }
}

export const investigationService = new InvestigationService();
export default investigationService;
