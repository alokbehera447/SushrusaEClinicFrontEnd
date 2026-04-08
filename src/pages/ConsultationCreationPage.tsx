import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsultationCreationForm from '@/components/forms/ConsultationCreationForm';
import ModernConsultationForm from '@/components/forms/ConsultationCreationForm';
import { useAuth } from '@/context/AuthContext';
import { superAdminApi } from '@/lib/api';

const ConsultationCreationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignedClinicId, setAssignedClinicId] = useState<string | undefined>();

  useEffect(() => {
    const fetchAssignedClinic = async () => {
      if (!user || user.role !== 'admin') return;
      
      try {
        const data = await superAdminApi.getEClinics({ page: 1, page_size: 10 });
        const assignedClinic = data.results.find((clinic) => clinic.admin === user.id);
        if (assignedClinic) {
          setAssignedClinicId(assignedClinic.id);
        }
      } catch (error) {
        console.error('Error fetching assigned clinic:', error);
      }
    };

    fetchAssignedClinic();
  }, [user]);

  const handleClose = () => {
          navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernConsultationForm onClose={handleClose} assignedClinicId={assignedClinicId} />
    </div>
  );
};

export default ConsultationCreationPage; 