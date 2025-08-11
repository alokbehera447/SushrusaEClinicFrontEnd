import React from 'react';
import VideoConsultation from './VideoConsultation';

/**
 * Example component demonstrating how to use VideoConsultation with prescription APIs
 * 
 * This component shows how to integrate the VideoConsultation component
 * with the existing prescription APIs for a consultation meeting.
 * 
 * Usage:
 * - Pass consultationId and patientId as props
 * - The component will automatically load existing prescriptions
 * - Users can create, edit, and generate PDF prescriptions
 * - All prescription data is saved to the backend using existing APIs
 */
const VideoConsultationExample = () => {
  // Example consultation and patient IDs
  const consultationId = 'CON068'; // This would come from your routing or props
  const patientId = 'PAT12345'; // This would come from your routing or props

  return (
    <div className="w-full h-screen">
      <VideoConsultation 
        consultationId={consultationId}
        patientId={patientId}
      />
    </div>
  );
};

export default VideoConsultationExample; 