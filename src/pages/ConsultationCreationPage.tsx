import React from 'react';
import { useNavigate } from 'react-router-dom';
import ConsultationCreationForm from '@/components/forms/ConsultationCreationForm';

const ConsultationCreationPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsultationCreationForm onClose={handleClose} />
    </div>
  );
};

export default ConsultationCreationPage; 