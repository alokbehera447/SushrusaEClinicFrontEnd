import React from 'react';
import PatientManagementTab from '../forms/PatientManagementTab';

interface PatientManagementProps {
  isDarkMode?: boolean;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ isDarkMode = false }) => {
  return <PatientManagementTab isDarkMode={isDarkMode} />;
};

export default PatientManagement;