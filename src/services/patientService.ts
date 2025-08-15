import { api } from '@/lib/utils';

// Types for Patient Management
export interface PatientProfile {
  id: number;
  user: string;
  user_name: string;
  user_phone: string;
  user_email: string | null;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  allergies: string;
  chronic_conditions: string[];
  current_medications: string[];
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  preferred_language: string;
  medical_history: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  created_at: string;
  updated_at: string;
  age: number;
  total_consultations?: number;
  last_consultation_date?: string | null;
}

export interface MedicalRecord {
  id: number;
  patient: string;
  patient_name: string;
  record_type: 'lab_report' | 'prescription' | 'diagnosis' | 'vaccination' | 'surgery' | 'allergy' | 'other';
  title: string;
  description: string;
  date_recorded: string;
  document?: string;
  document_url?: string;
  recorded_by: string;
  recorded_by_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientDocument {
  id: number;
  patient: string;
  patient_name: string;
  document_type: 'id_proof' | 'address_proof' | 'insurance_card' | 'medical_report' | 'prescription' | 'lab_report' | 'other';
  title: string;
  description: string;
  file: string;
  file_url?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_by_name?: string;
  verified_at?: string;
  uploaded_at: string;
  updated_at: string;
}

export interface PatientNote {
  id: number;
  patient: string;
  note: string;
  is_private: boolean;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  patient: string;
  patient_name: string;
  doctor: string;
  doctor_name: string;
  clinic: string;
  clinic_name: string;
  consultation_type: string;
  status: string;
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  duration: number;
  consultation_fee: string;
  payment_status: string;
  primary_diagnosis?: string;
  prescription_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientSearchParams {
  query?: string;
  gender?: string;
  blood_group?: string;
  age_min?: number;
  age_max?: number;
  city?: string;
  state?: string;
  page?: number;
  page_size?: number;
}

export interface PatientStats {
  total_patients: number;
  new_patients_this_month: number;
  active_patients: number;
  gender_distribution: Record<string, number>;
  age_distribution: Record<string, number>;
  blood_group_distribution: Record<string, number>;
  top_cities: [string, number][];
  consultation_stats: {
    total_consultations: number;
    avg_consultations_per_patient: number;
    consultation_completion_rate: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const patientService = {
  // Patient Profile Management
  async getPatient(patientId: string): Promise<ApiResponse<PatientProfile>> {
    const response = await api.get(`/api/patients/${patientId}/`);
    return response.data;
  },

  async updatePatient(patientId: string, data: Partial<PatientProfile>): Promise<ApiResponse<PatientProfile>> {
    const response = await api.patch(`/api/patients/${patientId}/`, data);
    return response.data;
  },

  // Medical Records Management
  async getMedicalRecords(patientId: string, params?: {
    record_type?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<MedicalRecord> | MedicalRecord[]>> {
    const response = await api.get(`/api/patients/${patientId}/medical-records/`, { params });
    return response.data;
  },

  async createMedicalRecord(patientId: string, data: FormData): Promise<ApiResponse<MedicalRecord>> {
    const response = await api.post(`/api/patients/${patientId}/medical-records/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateMedicalRecord(patientId: string, recordId: number, data: Partial<MedicalRecord>): Promise<ApiResponse<MedicalRecord>> {
    const response = await api.patch(`/api/patients/${patientId}/medical-records/${recordId}/`, data);
    return response.data;
  },

  async deleteMedicalRecord(patientId: string, recordId: number): Promise<ApiResponse<{ medical_record_id: string; status: string }>> {
    const response = await api.delete(`/api/patients/${patientId}/medical-records/${recordId}/`);
    return response.data;
  },

  // Patient Documents Management
  async getPatientDocuments(patientId: string, params?: {
    document_type?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<PatientDocument> | PatientDocument[]>> {
    const response = await api.get(`/api/patients/${patientId}/documents/`, { params });
    return response.data;
  },

  async uploadPatientDocument(patientId: string, data: FormData): Promise<ApiResponse<PatientDocument>> {
    const response = await api.post(`/api/patients/${patientId}/documents/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updatePatientDocument(patientId: string, documentId: number, data: Partial<PatientDocument>): Promise<ApiResponse<PatientDocument>> {
    const response = await api.patch(`/api/patients/${patientId}/documents/${documentId}/`, data);
    return response.data;
  },

  async deletePatientDocument(patientId: string, documentId: number): Promise<ApiResponse<{ document_id: string; status: string }>> {
    const response = await api.delete(`/api/patients/${patientId}/documents/${documentId}/`);
    return response.data;
  },

  // Patient Notes Management
  async getPatientNotes(patientId: string, params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<PatientNote> | PatientNote[]>> {
    const response = await api.get(`/api/patients/${patientId}/notes/`, { params });
    return response.data;
  },

  async createPatientNote(patientId: string, data: { note: string; is_private: boolean }): Promise<ApiResponse<PatientNote>> {
    const response = await api.post(`/api/patients/${patientId}/notes/`, data);
    return response.data;
  },

  async updatePatientNote(patientId: string, noteId: number, data: Partial<PatientNote>): Promise<ApiResponse<PatientNote>> {
    const response = await api.patch(`/api/patients/${patientId}/notes/${noteId}/`, data);
    return response.data;
  },

  async deletePatientNote(patientId: string, noteId: number): Promise<ApiResponse<{ note_id: string; status: string }>> {
    const response = await api.delete(`/api/patients/${patientId}/notes/${noteId}/`);
    return response.data;
  },

  // Patient Consultations
  async getPatientConsultations(patientId: string, params?: {
    status?: string;
    doctor?: string;
    date_from?: string;
    date_to?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<Consultation> | Consultation[]>> {
    const response = await api.get(`/api/patients/${patientId}/consultations/`, { params });
    return response.data;
  },

  // Patient Search
  async searchPatients(params: PatientSearchParams): Promise<ApiResponse<PaginatedResponse<PatientProfile> | PatientProfile[]> | any> {
    const response = await api.get('/api/patients/search/', { params });
    return response.data;
  },

  // Patient Statistics
  async getPatientStats(): Promise<ApiResponse<PatientStats>> {
    const response = await api.get('/api/patients/stats/');
    return response.data;
  },

  // Utility functions
  getFileUrl(fileUrl: string | undefined): string | undefined {
    if (!fileUrl) return undefined;
    // If it's already a full URL, return as is
    if (fileUrl.startsWith('http')) return fileUrl;
    // Otherwise, construct the full URL
    return `${api.defaults.baseURL}${fileUrl}`;
  },

  createFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return formData;
  }
};
