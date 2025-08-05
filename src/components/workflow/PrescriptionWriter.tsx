import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrescriptionWriterProps {
  consultationId: string;
  onClose: () => void;
}

const DEFAULT_HEADER = (
  <div className="flex items-center gap-4 px-6 py-4 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #E17726 0%, #ffb380 100%)' }}>
    <img src="/sushrusa_logo_1-Photoroom.png" alt="Sushrusa Logo" className="h-20 w-20 object-contain" />
    <div className="flex-1 text-center">
      <div className="text-lg font-bold text-white">Sushrusa eClinic</div>
      <div className="text-sm text-white">123 Health Street, City</div>
      <div className="text-xs text-white">Phone: +91-12345-67890 | Email: info@sushrusa.com</div>
      <div className="text-xs text-white">Reg. No: 123456</div>
    </div>
  </div>
);

const DEFAULT_FOOTER = (
  <div className="px-6 py-3 border-t bg-gradient-to-r from-orange-100 to-orange-50 text-xs text-gray-700 rounded-b-2xl">
    Thank you for choosing Sushrusa eClinic.<br />
    For emergencies, call 108.<br />
    This prescription is valid for 30 days from the date of issue.<br />
    ---<br />
    Doctor's digital signature.
  </div>
);

const PrescriptionWriter: React.FC<PrescriptionWriterProps> = ({ consultationId, onClose }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  // Mock patient info (replace with real data from backend/API in future)
  const patientInfo = {
    id: 'PAT123456',
    name: 'Rajesh Kumar',
    address: '45, Green Avenue, City',
    date: new Date().toLocaleDateString(),
    bloodGroup: 'B+'
  };

  const handleSave = async () => {
    setDownloading(true);
    setPrintMode(true);
    // Wait for the overlay to render
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (prescriptionRef.current) {
      const canvas = await html2canvas(prescriptionRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'portrait' });
      // Calculate width/height to fit A4
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      // Scale image to fit width
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const pdfWidth = imgWidth * ratio;
      const pdfHeight = imgHeight * ratio;
      const x = (pageWidth - pdfWidth) / 2;
      const y = 20; // top margin
      pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
      pdf.save(`Prescription_${patientInfo.id}_${patientInfo.name.replace(/\s/g, '')}.pdf`);
    }
    setPrintMode(false);
    setDownloading(false);
  };

  return (
    <div>
      {/* Print/Download Fullscreen Overlay */}
      {printMode && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 9999 }}>
          <div
            ref={prescriptionRef}
            className="w-full max-w-3xl mx-auto bg-white border-2 border-orange-200 overflow-hidden relative"
            style={{ marginTop: 0, borderRadius: 0, boxShadow: 'none', height: '1122px', maxHeight: '1122px', overflow: 'hidden' }}
          >
            {DEFAULT_HEADER}
            <div className="px-8 py-4 bg-orange-50 border-b border-orange-200 flex flex-wrap gap-6 text-sm font-medium text-gray-700">
              <div><span className="text-gray-500">Patient ID:</span> {patientInfo.id}</div>
              <div><span className="text-gray-500">Name:</span> {patientInfo.name}</div>
              <div><span className="text-gray-500">Address:</span> {patientInfo.address}</div>
              <div><span className="text-gray-500">Date:</span> {patientInfo.date}</div>
              <div><span className="text-gray-500">Blood Group:</span> {patientInfo.bloodGroup}</div>
            </div>
            <div className="flex-1 bg-white p-4">
              <div
                className="min-h-[250px] outline-none text-base leading-relaxed font-sans"
                style={{ border: '1px solid #f3c48b', borderRadius: 8, background: '#fffbe9', padding: 12 }}
                // Not editable in print mode
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: bodyRef.current?.innerHTML || '' }}
              />
            </div>
            {DEFAULT_FOOTER}
          </div>
        </div>
      )}
      {/* Normal UI */}
      {!printMode && (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center pt-10">
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
            {/* Main Prescription Card */}
            <div className="flex-1 flex justify-center">
              <div
                ref={prescriptionRef}
                className="w-full max-w-3xl mx-auto mt-6 bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden relative"
                style={{ height: '1122px', maxHeight: '1122px', overflow: 'hidden' }}
              >
                {DEFAULT_HEADER}
                {/* Patient Info Section */}
                <div className="px-8 py-4 bg-orange-50 border-b border-orange-200 flex flex-wrap gap-6 text-sm font-medium text-gray-700">
                  <div><span className="text-gray-500">Patient ID:</span> {patientInfo.id}</div>
                  <div><span className="text-gray-500">Name:</span> {patientInfo.name}</div>
                  <div><span className="text-gray-500">Address:</span> {patientInfo.address}</div>
                  <div><span className="text-gray-500">Date:</span> {patientInfo.date}</div>
                  <div><span className="text-gray-500">Blood Group:</span> {patientInfo.bloodGroup}</div>
                </div>
                <div className="flex-1 bg-white p-4">
                  <div
                    ref={bodyRef}
                    className="min-h-[250px] outline-none text-base leading-relaxed font-sans"
                    contentEditable
                    suppressContentEditableWarning
                    style={{ border: '1px solid #f3c48b', borderRadius: 8, background: '#fffbe9', padding: 12 }}
                  >
                    Enter prescription details here (diagnosis, medicines, instructions, etc.)
                  </div>
                </div>
                {DEFAULT_FOOTER}
              </div>
            </div>
            {/* Sidebar: Tips, Branding, or Actions */}
            <div className="w-full md:w-80 flex flex-col gap-6 mt-6">
              <div className="bg-gradient-to-br from-[#E17726]/90 to-[#ffb380]/80 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Prescription Tips</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Double-check patient details before saving.</li>
                  <li>Include clear dosage and timing for each medicine.</li>
                  <li>Use generic names where possible.</li>
                  <li>Sign digitally for authenticity.</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-orange-100">
                <img src="/sushrusa_logo_1-Photoroom.png" alt="Sushrusa Logo" className="h-24 w-24 mb-2 object-contain" />
                <div className="text-orange-700 font-bold text-lg">Sushrusa eClinic</div>
                <div className="text-xs text-gray-500 text-center mt-1">Your trusted partner in digital healthcare.</div>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 w-full max-w-6xl px-8 py-6 mt-4">
            <Button variant="outline" onClick={onClose} className="border-orange-300 text-orange-700">Cancel</Button>
            <Button style={{ background: 'linear-gradient(90deg, #E17726 0%, #ffb380 100%)', color: '#fff' }} onClick={handleSave} disabled={downloading}>
              {downloading ? 'Downloading...' : 'Save Prescription as PDF'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionWriter; 