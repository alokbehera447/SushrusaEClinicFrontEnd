import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PatientIDCardProps {
  name: string;
  patientId: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  phone?: string;
  profilePicture?: string;
}

const getAge = (dob?: string): number | undefined => {
  if (!dob) return undefined;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const PatientIDCard: React.FC<PatientIDCardProps> = ({
  name,
  patientId,
  dateOfBirth,
  age,
  gender,
  phone,
  profilePicture,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (type: 'png' | 'pdf') => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
    if (type === 'png') {
      const link = document.createElement('a');
      link.download = `${patientId}_id_card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [350, 200] });
      pdf.addImage(imgData, 'PNG', 0, 0, 350, 200);
      pdf.save(`${patientId}_id_card.pdf`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={cardRef}
        className="w-[350px] h-[200px] bg-white rounded-2xl shadow-xl border-2 border-orange-200 flex flex-row overflow-hidden relative"
        style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 24px 0 rgba(225,119,38,0.10)' }}
      >
        {/* Left: Logo and theme bar */}
        <div className="w-2 bg-gradient-to-b from-[#E17726] to-[#ffb380]" />
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14 border-2 border-orange-200 bg-orange-50">
              {profilePicture ? (
                <AvatarImage src={profilePicture} alt={name} />
              ) : (
                <AvatarFallback className="bg-orange-100 text-orange-700 text-xl font-bold">
                  {name?.[0] || 'P'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="text-lg font-bold text-gray-900 leading-tight">{name}</div>
              <div className="text-xs text-gray-500 font-mono tracking-wider">ID: {patientId}</div>
            </div>
            <img
              src="/sushrusa_logo_1-Photoroom.png"
              alt="Sushrusa Logo"
              className="h-8 w-8 ml-auto object-contain"
            />
          </div>
          <div className="flex flex-col gap-1 mt-2 text-sm text-gray-700">
            <div><span className="font-semibold">DOB:</span> {dateOfBirth || '--'}{(age || getAge(dateOfBirth)) ? ` (Age: ${age || getAge(dateOfBirth)})` : ''}</div>
            <div><span className="font-semibold">Gender:</span> {gender || '--'}</div>
            <div><span className="font-semibold">Mobile:</span> {phone || '--'}</div>
          </div>
          <div className="absolute bottom-2 right-4 text-xs text-orange-600 font-semibold tracking-wide opacity-80">
            Sushrusa eClinic Virtual ID Card
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50" onClick={() => handleDownload('png')}>
          Download PNG
        </Button>
        <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50" onClick={() => handleDownload('pdf')}>
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default PatientIDCard;
