import React, { useState, useEffect } from 'react';
import { doctorApi, PublicDoctorProfile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const TestDoctors = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<PublicDoctorProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await doctorApi.getPublicDoctors({
        page: 1,
        page_size: 10
      });
      setDoctors(response.results || []);
      toast({
        title: "Success",
        description: `Found ${response.count} doctors`,
        variant: "default",
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Doctor API Test</h1>
      <button 
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Loading...' : 'Test API'}
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map(doctor => (
          <div key={doctor.id} className="border p-4 rounded">
            <h3 className="font-bold">{doctor.name}</h3>
            <p className="text-sm text-gray-600">{doctor.specialization}</p>
            <p className="text-sm">Experience: {doctor.experience_years} years</p>
            <p className="text-sm">Fee: ₹{doctor.consultation_fee}</p>
            <p className="text-sm">Rating: {doctor.rating}</p>
            <p className="text-sm">Location: {doctor.clinic_address}</p>
            <p className="text-sm">Types: {doctor.consultation_types.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestDoctors; 