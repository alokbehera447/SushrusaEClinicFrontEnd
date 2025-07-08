import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  Printer, 
  Download,
  User,
  Calendar,
  Clock,
  Pill,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const PrescriptionWriter = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [currentMedicine, setCurrentMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  // Mock data
  const patientInfo = {
    id: 'PAT12345',
    name: 'Rajesh Kumar',
    age: 42,
    gender: 'Male',
    phone: '+91 98765 43210',
    appointmentId: 'APT-2024-001',
    consultationDate: '2024-01-15',
    allergies: 'Penicillin, Dust'
  };

  const doctorInfo = {
    name: 'Dr. Priya Singh',
    specialty: 'Cardiology',
    license: 'MCI-12345',
    clinic: 'Sushrusa Clinic - Delhi'
  };

  const commonMedicines = [
    { name: 'Paracetamol 500mg', type: 'Analgesic' },
    { name: 'Amoxicillin 250mg', type: 'Antibiotic' },
    { name: 'Omeprazole 20mg', type: 'Proton Pump Inhibitor' },
    { name: 'Atorvastatin 20mg', type: 'Statin' },
    { name: 'Metformin 500mg', type: 'Antidiabetic' },
    { name: 'Amlodipine 5mg', type: 'ACE Inhibitor' }
  ];

  const frequencies = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
    'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'As needed'
  ];

  const durations = [
    '3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days', '60 days', '90 days'
  ];

  const addMedicine = () => {
    if (currentMedicine.name && currentMedicine.dosage) {
      const newMedicine: Medicine = {
        id: Date.now().toString(),
        ...currentMedicine
      };
      setMedicines([...medicines, newMedicine]);
      setCurrentMedicine({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
    }
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const filteredMedicines = commonMedicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-midnight">Digital Prescription</h1>
              <Badge className="bg-[#E17726]/10 text-[#E17726] border-[#E17726]/20">
                {patientInfo.appointmentId}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-gray-300">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button className="bg-[#E17726] hover:bg-[#c9651e] text-white">
                <Printer className="w-4 h-4 mr-2" />
                Print Prescription
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Medicine Selection Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Medicine Section */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Add Medicine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Medicine Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Medicine</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      placeholder="Search for medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  {searchTerm && (
                    <div className="mt-2 max-h-32 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-md">
                      {filteredMedicines.map((med, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setCurrentMedicine({...currentMedicine, name: med.name});
                            setSearchTerm('');
                          }}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-midnight">{med.name}</div>
                          <div className="text-sm text-gray-600">{med.type}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medicine Details Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name</label>
                    <Input 
                      placeholder="Enter medicine name"
                      value={currentMedicine.name}
                      onChange={(e) => setCurrentMedicine({...currentMedicine, name: e.target.value})}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                    <Input 
                      placeholder="e.g., 500mg, 1 tablet"
                      value={currentMedicine.dosage}
                      onChange={(e) => setCurrentMedicine({...currentMedicine, dosage: e.target.value})}
                      className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select 
                      value={currentMedicine.frequency}
                      onChange={(e) => setCurrentMedicine({...currentMedicine, frequency: e.target.value})}
                      className="w-full h-12 rounded-xl border border-gray-300 px-3 focus:border-[#E17726] focus:ring-[#E17726] focus:outline-none"
                    >
                      <option value="">Select frequency</option>
                      {frequencies.map((freq, index) => (
                        <option key={index} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select 
                      value={currentMedicine.duration}
                      onChange={(e) => setCurrentMedicine({...currentMedicine, duration: e.target.value})}
                      className="w-full h-12 rounded-xl border border-gray-300 px-3 focus:border-[#E17726] focus:ring-[#E17726] focus:outline-none"
                    >
                      <option value="">Select duration</option>
                      {durations.map((duration, index) => (
                        <option key={index} value={duration}>{duration}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                  <Input 
                    placeholder="e.g., Take after meals, Before bedtime"
                    value={currentMedicine.instructions}
                    onChange={(e) => setCurrentMedicine({...currentMedicine, instructions: e.target.value})}
                    className="h-12 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  />
                </div>

                <Button 
                  onClick={addMedicine}
                  className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white h-12 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medicine
                </Button>
              </CardContent>
            </Card>

            {/* Prescription List */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Prescribed Medicines</CardTitle>
              </CardHeader>
              <CardContent>
                {medicines.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No medicines added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicines.map((medicine, index) => (
                      <div key={medicine.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-[#E17726]">#{index + 1}</span>
                            <h4 className="font-semibold text-midnight">{medicine.name}</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            <span><strong>Dosage:</strong> {medicine.dosage}</span>
                            <span><strong>Frequency:</strong> {medicine.frequency}</span>
                            <span><strong>Duration:</strong> {medicine.duration}</span>
                            <span><strong>Instructions:</strong> {medicine.instructions}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMedicine(medicine.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50 ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Diagnosis and Notes */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Diagnosis & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                  <Textarea
                    placeholder="Enter diagnosis..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="min-h-24 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <Textarea
                    placeholder="Add any additional instructions or notes..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="min-h-24 rounded-xl border-gray-300 focus:border-[#E17726] focus:ring-[#E17726]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prescription Preview Panel */}
          <div className="space-y-6">
            {/* Patient Information */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback className="bg-[#E17726]/10 text-[#E17726] font-semibold text-lg">
                      {patientInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-midnight">{patientInfo.name}</h3>
                  <p className="text-sm text-gray-600">{patientInfo.id}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{patientInfo.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{patientInfo.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{patientInfo.consultationDate}</span>
                  </div>
                </div>

                {patientInfo.allergies && (
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <h4 className="font-semibold text-red-600">Allergies</h4>
                    </div>
                    <p className="text-sm text-red-600">{patientInfo.allergies}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Doctor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{doctorInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialty:</span>
                  <span className="font-medium">{doctorInfo.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">License:</span>
                  <span className="font-medium">{doctorInfo.license}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clinic:</span>
                  <span className="font-medium text-sm">{doctorInfo.clinic}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white justify-start h-12 rounded-xl">
                  <FileText className="w-5 h-5 mr-3" />
                  Generate Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-aqua text-aqua hover:bg-aqua hover:text-white">
                  <Download className="w-5 h-5 mr-3" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Printer className="w-5 h-5 mr-3" />
                  Print Prescription
                </Button>
              </CardContent>
            </Card>

            {/* Prescription Summary */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Medicines:</span>
                  <span className="font-medium">{medicines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={medicines.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {medicines.length > 0 ? 'Ready to Generate' : 'Incomplete'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionWriter; 