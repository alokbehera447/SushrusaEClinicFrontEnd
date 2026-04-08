import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  CreditCard, 
  FileText, 
  Users, 
  Video, 
  Settings, 
  BarChart3,
  ArrowRight,
  Heart
} from 'lucide-react';

const WorkflowDemo = () => {
  const workflows = [
    {
      name: 'Appointment Booking',
      description: 'Complete 5-step appointment booking process with patient details, doctor selection, and payment',
      path: '/workflow/appointment-booking',
      icon: Calendar,
      color: 'bg-blue-500',
      features: ['Patient Registration', 'Doctor Selection', 'Time Slot Booking', 'Payment Processing', 'Confirmation']
    },
    {
      name: 'Patient Registration',
      description: 'Comprehensive patient registration with personal info, medical history, and document upload',
      path: '/workflow/patient-registration',
      icon: User,
      color: 'bg-green-500',
      features: ['Personal Information', 'Medical History', 'Document Upload', 'Emergency Contacts', 'Review & Confirm']
    },
    {
      name: 'Payment Processing',
      description: 'Multi-method payment system with UPI, cards, wallets, and transaction management',
      path: '/workflow/payment-processing',
      icon: CreditCard,
      color: 'bg-[#E17726]',
      features: ['Multiple Payment Methods', 'QR Code Payments', 'Transaction History', 'Receipt Generation', 'Refund Management']
    },
    {
      name: 'Prescription Writer',
      description: 'Digital prescription creation with medicine database, dosage management, and printing',
      path: '/workflow/prescription-writer',
      icon: FileText,
      color: 'bg-purple-500',
      features: ['Medicine Database', 'Dosage Management', 'Digital Signatures', 'Prescription Printing', 'Patient Records']
    },
    {
      name: 'Queue Management',
      description: 'Real-time queue management with patient tracking, wait times, and priority handling',
      path: '/workflow/queue-management',
      icon: Users,
      color: 'bg-aqua',
      features: ['Real-time Updates', 'Wait Time Tracking', 'Priority Queues', 'Patient Notifications', 'Activity Feed']
    },
    {
      name: 'Video Consultation',
      description: 'Full-featured video consultation with patient info, vitals, and prescription writing',
      path: '/workflow/video-consultation',
      icon: Video,
      color: 'bg-red-500',
      features: ['Video/Audio Controls', 'Patient Information', 'Vital Signs', 'Prescription Writing', 'Consultation Notes']
    },
    {
      name: 'Doctor Schedule',
      description: 'Comprehensive schedule management with calendar view, time slots, and availability settings',
      path: '/workflow/doctor-schedule',
      icon: Settings,
      color: 'bg-yellow-500',
      features: ['Calendar View', 'Time Slot Management', 'Availability Settings', 'Schedule Templates', 'Occupancy Tracking']
    },
    {
      name: 'Analytics Dashboard',
      description: 'Comprehensive analytics with KPIs, charts, revenue tracking, and performance metrics',
      path: '/workflow/analytics',
      icon: BarChart3,
      color: 'bg-indigo-500',
      features: ['Revenue Analytics', 'Patient Flow', 'Doctor Performance', 'Key Insights', 'Export Reports']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-[#E17726] p-2 rounded-xl shadow-md">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-midnight">SUSHRUSA</span>
                  <span className="text-sm text-gray-500 ml-1">eClinic</span>
                </div>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-midnight">Workflow Components Demo</h1>
            </div>
            <Link to="/">
              <Button variant="outline" className="border-gray-300">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-midnight mb-4">
            Complete Healthcare Workflow System
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore all the workflow components designed for the Sushrusha eClinic Platform. 
            Each component is fully functional with modern UI/UX and comprehensive features.
          </p>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workflows.map((workflow, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden group">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${workflow.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    <workflow.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-midnight">{workflow.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700 text-sm">Key Features:</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {workflow.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#E17726] rounded-full"></div>
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Link to={workflow.path}>
                  <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white group-hover:scale-105 transition-all duration-300">
                    <span>View {workflow.name}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-midnight mb-4">About These Workflows</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              These workflow components represent a complete healthcare management system designed for modern e-clinics. 
              Each component is built with React, TypeScript, and modern UI libraries, featuring responsive design, 
              accessibility compliance, and comprehensive functionality.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-midnight mb-2">Technology Stack</h4>
                <p className="text-gray-600">React, TypeScript, Tailwind CSS, Lucide Icons, Modern UI Components</p>
              </div>
              <div>
                <h4 className="font-semibold text-midnight mb-2">Design Features</h4>
                <p className="text-gray-600">Responsive Design, Accessibility, Modern UI/UX, Consistent Branding</p>
              </div>
              <div>
                <h4 className="font-semibold text-midnight mb-2">Functionality</h4>
                <p className="text-gray-600">Real-time Updates, Form Validation, State Management, Interactive Elements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDemo; 