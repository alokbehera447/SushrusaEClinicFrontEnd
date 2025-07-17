import { api } from './utils';

// Types for patient data
export interface PatientProfile {
  id: string;
  user: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  date_of_birth: string | null;
  gender: string;
  blood_group: string;
  allergies: string;
  chronic_conditions: string[];
  current_medications: string[];
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_expiry: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
  age: number | null;
}

export interface UserProfile {
  id: string;
  phone: string;
  email: string;
  name: string;
  role: string;
  date_of_birth: string | null;
  gender: string;
  profile_picture: string | null;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  blood_group: string;
  allergies: string;
  medical_history: string;
  is_verified: boolean;
  date_joined: string;
  age: number | null;
  full_address: string;
}

export interface Consultation {
  id: string;
  patient: string;
  doctor: string;
  patient_name: string;
  doctor_name: string;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration: number;
  status: string;
  payment_status: string;
  consultation_fee: number;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  consultation: string;
  doctor: string;
  patient: string;
  patient_name: string;
  doctor_name: string;
  diagnosis: string;
  symptoms: string;
  general_instructions: string;
  header: string;
  body: string;
  footer: string;
  issued_date: string;
  valid_until: string;
  status: string;
  follow_up_required: boolean;
  follow_up_date: string | null;
  follow_up_instructions: string;
  digital_signature: string;
  is_verified: boolean;
  verification_code: string;
  total_medications: number;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: number;
  prescription: string;
  name: string;
  generic_name: string;
  brand_name: string;
  strength: string;
  dosage_form: string;
  dosage: string;
  frequency: string;
  custom_frequency: string;
  timing: string;
  duration_days: number;
  total_quantity: number;
  special_instructions: string;
  side_effects_warning: string;
  substitution_allowed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: number;
  patient: string;
  record_type: string;
  title: string;
  description: string;
  date_recorded: string;
  document: string | null;
  recorded_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientDocument {
  id: number;
  patient: string;
  document_type: string;
  title: string;
  description: string;
  file: string;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  uploaded_at: string;
  updated_at: string;
}

export interface PatientNote {
  id: number;
  patient: string;
  note: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// E-Clinic interfaces
export interface EClinic {
  id: string;
  name: string;
  clinic_type: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  operating_hours: Record<string, string>;
  specialties: string[];
  services: string[];
  facilities: string[];
  registration_number: string;
  license_number: string;
  accreditation: string;
  logo: string | null;
  cover_image: string | null;
  gallery_images: string[];
  is_active: boolean;
  is_verified: boolean;
  accepts_online_consultations: boolean;
  admin: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEClinicData {
  name: string;
  clinic_type?: string;
  description?: string;
  phone: string;
  email: string;
  website?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  operating_hours?: Record<string, string>;
  specialties?: string[];
  services?: string[];
  facilities?: string[];
  registration_number: string;
  license_number?: string;
  accreditation?: string;
  logo?: File;
  cover_image?: File;
  gallery_images?: string[];
  is_active?: boolean;
  accepts_online_consultations?: boolean;
}

// API Response types
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

// Patient API service functions
export const patientApi = {
  // Get current user's profile
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>('/api/auth/profile/');
    return response.data.data;
  },

  // Get patient profile
  getPatientProfile: async (patientId?: string): Promise<PatientProfile> => {
    const url = patientId ? `/api/patients/${patientId}/` : '/api/patients/';
    const response = await api.get<ApiResponse<PatientProfile>>(url);
    return response.data.data;
  },

  // Get patient consultations
  getPatientConsultations: async (patientId?: string): Promise<Consultation[]> => {
    const url = patientId 
      ? `/api/consultations/?patient=${patientId}` 
      : '/api/consultations/';
    const response = await api.get<ApiResponse<PaginatedResponse<Consultation>>>(url);
    return response.data.data.results;
  },

  // Get consultation prescriptions
  getConsultationPrescriptions: async (consultationId: string): Promise<Prescription[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Prescription>>>(
      `/api/prescriptions/?consultation=${consultationId}`
    );
    return response.data.data.results;
  },

  // Get prescription medications
  getPrescriptionMedications: async (prescriptionId: string): Promise<Medication[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Medication>>>(
      `/api/prescriptions/${prescriptionId}/medications/`
    );
    return response.data.data.results;
  },

  // Get patient medical records
  getPatientMedicalRecords: async (patientId: string): Promise<MedicalRecord[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<MedicalRecord>>>(
      `/api/patients/${patientId}/medical-records/`
    );
    return response.data.data.results;
  },

  // Get patient documents
  getPatientDocuments: async (patientId: string): Promise<PatientDocument[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<PatientDocument>>>(
      `/api/patients/${patientId}/documents/`
    );
    return response.data.data.results;
  },

  // Get patient notes
  getPatientNotes: async (patientId: string): Promise<PatientNote[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<PatientNote>>>(
      `/api/patients/${patientId}/notes/`
    );
    return response.data.data.results;
  },

  // Update user profile
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>('/api/auth/profile/', profileData);
    return response.data.data;
  },

  // Update patient profile
  updatePatientProfile: async (patientId: string, profileData: Partial<PatientProfile>): Promise<PatientProfile> => {
    const response = await api.put<ApiResponse<PatientProfile>>(`/api/patients/${patientId}/`, profileData);
    return response.data.data;
  }
};

// User Session interface
export interface UserSession {
  id: string;
  user: string;
  refresh_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// SuperAdmin API service functions
export const superAdminApi = {
  // Get current SuperAdmin profile
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>('/api/auth/profile/');
    return response.data.data;
  },

  // Update SuperAdmin profile
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>('/api/auth/profile/', profileData);
    return response.data.data;
  },

  // Change password
  changePassword: async (passwordData: { old_password: string; new_password: string }): Promise<void> => {
    await api.post('/api/auth/change-password/', passwordData);
  },

  // Get user sessions
  getUserSessions: async (): Promise<UserSession[]> => {
    const response = await api.get<ApiResponse<UserSession[]>>('/api/auth/sessions/');
    return response.data.data;
  },

  // Terminate session
  terminateSession: async (sessionId: string): Promise<void> => {
    await api.delete('/api/auth/sessions/', { data: { session_id: sessionId } });
  },

  // Logout
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/api/auth/logout/', { refresh: refreshToken });
  },

  // E-Clinic Management
  // Get all e-clinics
  getEClinics: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    city?: string;
    state?: string;
    is_verified?: string;
    is_active?: string;
    ordering?: string;
  }): Promise<{ results: EClinic[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/api/eclinic/?${queryParams.toString()}`);
    return response.data;
  },

  // Get clinic statistics for dashboard
  getClinicStats: async (): Promise<{
    total_clinics: { value: number; change: string };
    active_clinics: { value: number; change: string };
    online_consultations: { value: number; change: string };
    inactive_clinics: { value: number; change: string };
  }> => {
    const response = await api.get('/api/eclinic/stats/');
    return response.data.data;
  },

  // Get single e-clinic
  getEClinic: async (clinicId: string): Promise<EClinic> => {
    const response = await api.get<ApiResponse<EClinic>>(`/api/eclinic/${clinicId}/`);
    return response.data.data;
  },

  // Create new e-clinic
  createEClinic: async (clinicData: CreateEClinicData): Promise<EClinic> => {
    const response = await api.post<ApiResponse<EClinic>>('/api/eclinic/', clinicData);
    return response.data.data;
  },

  // Update e-clinic
  updateEClinic: async (clinicId: string, clinicData: Partial<CreateEClinicData>): Promise<EClinic> => {
    const response = await api.put<ApiResponse<EClinic>>(`/api/eclinic/${clinicId}/`, clinicData);
    return response.data.data;
  },

  // Delete e-clinic
  deleteEClinic: async (clinicId: string): Promise<void> => {
    await api.delete(`/api/eclinic/${clinicId}/`);
  },

  // Get admin users for e-clinic assignment
  getAdminUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get('/api/auth/admin/users/?type=admins');
    return response.data.data || [];
  },

  // Get comprehensive platform overview statistics
  getOverviewStats: async (): Promise<{
    total_clinics: { value: number; change: string };
    active_clinics: { value: number; change: string };
    total_doctors: { value: number; change: string };
    active_doctors: { value: number; change: string };
    total_admins: { value: number; change: string };
    total_patients: { value: number; change: string };
    total_consultations: { value: number; change: string };
    total_revenue: { value: number; change: string };
  }> => {
    const response = await api.get('/api/analytics/superadmin/overview/');
    return response.data.data;
  }
};

// Doctor API service functions
export interface CreateDoctorUserData {
  phone: string;
  name: string;
  email?: string;
  password?: string;
}

export interface CreateDoctorProfileData {
  license_number: string;
  qualification: string;
  specialization: string;
  sub_specialization?: string;
  consultation_fee: number;
  online_consultation_fee?: number;
  languages_spoken: string[];
  bio?: string;
  achievements?: string;
  consultation_duration?: number;
  is_online_consultation_available?: boolean;
  clinic_name?: string;
  clinic_address?: string;
  is_active?: boolean;
}

export interface DoctorProfile {
  id: number;
  user: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  license_number: string;
  qualification: string;
  specialization: string;
  sub_specialization?: string;
  experience_years: number;
  consultation_fee: number;
  online_consultation_fee?: number;
  languages_spoken: string[];
  bio?: string;
  achievements?: string;
  consultation_duration?: number;
  is_online_consultation_available?: boolean;
  clinic_name?: string;
  clinic_address?: string;
  is_verified: boolean;
  is_active: boolean;
  is_accepting_patients: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export const doctorApi = {
  // Create doctor account and profile in one call (SuperAdmin only)
  createDoctor: async (data: CreateDoctorUserData & CreateDoctorProfileData): Promise<{
    doctor_profile: DoctorProfile;
    user_account: {
      user_id: string;
      phone: string;
      name: string;
      email: string;
      role: string;
      password: string;
    };
  }> => {
    const response = await api.post<ApiResponse<{
      doctor_profile: DoctorProfile;
      user_account: {
        user_id: string;
        phone: string;
        name: string;
        email: string;
        role: string;
        password: string;
      };
    }>>('/api/doctors/superadmin/', data);
    return response.data.data;
  },

  // Create doctor user (account) as admin/superadmin (legacy)
  createDoctorUser: async (data: CreateDoctorUserData): Promise<UserProfile> => {
    const response = await api.post<ApiResponse<UserProfile>>('/api/auth/admin/users/', {
      ...data,
      role: 'doctor',
    });
    return response.data.data;
  },

  // Create doctor profile (must be called as the doctor user)
  createDoctorProfile: async (profileData: CreateDoctorProfileData): Promise<DoctorProfile> => {
    const response = await api.post<ApiResponse<DoctorProfile>>('/api/doctors/', profileData);
    return response.data.data;
  },

  // List all doctors (SuperAdmin only)
  getDoctors: async (params?: { 
    search?: string; 
    is_active?: boolean; 
    is_verified?: boolean;
    specialization?: string;
  }): Promise<DoctorProfile[]> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.search) queryParams.append('search', params.search);
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active ? 'true' : 'false');
      if (params.is_verified !== undefined) queryParams.append('is_verified', params.is_verified ? 'true' : 'false');
      if (params.specialization) queryParams.append('specialization', params.specialization);
    }
    const response = await api.get(`/api/doctors/superadmin/?${queryParams.toString()}`);
    
    // Handle different response structures
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    // Fallback to empty array
    return [];
  },

  // Get doctor details by ID (SuperAdmin only)
  getDoctor: async (doctorId: string): Promise<DoctorProfile> => {
    const response = await api.get<ApiResponse<DoctorProfile>>(`/api/doctors/superadmin/${doctorId}/`);
    return response.data.data;
  },

  // Update doctor profile (SuperAdmin only)
  updateDoctor: async (doctorId: string, data: Partial<CreateDoctorProfileData>): Promise<DoctorProfile> => {
    const response = await api.put<ApiResponse<DoctorProfile>>(`/api/doctors/superadmin/${doctorId}/`, data);
    return response.data.data;
  },

  // Delete/deactivate doctor (SuperAdmin only)
  deleteDoctor: async (doctorId: string): Promise<{
    doctor_id: string;
    user_id: string;
    status: string;
  }> => {
    const response = await api.delete<ApiResponse<{
      doctor_id: string;
      user_id: string;
      status: string;
    }>>(`/api/doctors/superadmin/${doctorId}/`);
    return response.data.data;
  },
};

// Utility functions
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 