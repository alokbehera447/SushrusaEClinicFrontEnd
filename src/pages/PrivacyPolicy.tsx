import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, Users, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const privacyFeatures = [
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Your health data is protected under strict HIPAA regulations"
    },
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All communications and data are encrypted using industry-standard protocols"
    },
    {
      icon: Eye,
      title: "Transparent Practices",
      description: "Clear information about how we collect, use, and protect your data"
    },
    {
      icon: Database,
      title: "Secure Storage",
      description: "Your information is stored in secure, certified data centers"
    }
  ];

  const dataCategories = [
    {
      category: "Personal Information",
      items: ["Name, email, phone number", "Date of birth and gender", "Emergency contact details", "Insurance information"]
    },
    {
      category: "Health Information",
      items: ["Medical history and conditions", "Medications and allergies", "Lab results and reports", "Treatment plans and notes"]
    },
    {
      category: "Usage Data",
      items: ["Appointment bookings", "Consultation records", "Payment information", "Communication logs"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-[#E17726]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-[#E17726] p-2 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-midnight">Privacy Policy</h1>
                  <p className="text-gray-600">Last updated: January 2024</p>
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              HIPAA Compliant
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Privacy Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {privacyFeatures.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#E17726]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-[#E17726]" />
                </div>
                <h3 className="font-semibold text-midnight mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Policy */}
          <div className="lg:col-span-2 space-y-8">
            {/* Introduction */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Your Privacy Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  At SUSHRUSA eClinic, we are committed to protecting your privacy and ensuring the security of your health information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We understand the sensitive nature of health information and have implemented comprehensive security measures 
                  to protect your data in accordance with HIPAA regulations and industry best practices.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {dataCategories.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-semibold text-midnight text-lg">{category.category}</h4>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#E17726] rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-midnight">Healthcare Services</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Providing medical consultations</li>
                      <li>• Managing appointments</li>
                      <li>• Processing prescriptions</li>
                      <li>• Coordinating with healthcare providers</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-midnight">Platform Operations</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Account management</li>
                      <li>• Payment processing</li>
                      <li>• Customer support</li>
                      <li>• Platform improvements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Data Security & Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect your information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Regular security audits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Access controls</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Data backup systems</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Staff training</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Incident response plans</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Your Privacy Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-midnight">Access & Control</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• View your personal information</li>
                      <li>• Update or correct your data</li>
                      <li>• Request data deletion</li>
                      <li>• Download your health records</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-midnight">Communication Preferences</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Manage notification settings</li>
                      <li>• Control marketing communications</li>
                      <li>• Set privacy preferences</li>
                      <li>• Opt-out of data sharing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#E17726]/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#E17726]" />
                    </div>
                    <div>
                      <p className="font-medium text-midnight">Privacy Officer</p>
                      <p className="text-sm text-gray-600">privacy@sushrusa.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#E17726]/10 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#E17726]" />
                    </div>
                    <div>
                      <p className="font-medium text-midnight">Support Team</p>
                      <p className="text-sm text-gray-600">support@sushrusa.com</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white">
                  Contact Privacy Team
                </Button>
              </CardContent>
            </Card>

            {/* Key Points */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Key Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">HIPAA compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">No data selling</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Transparent practices</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Your data, your control</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Policy Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  We may update this privacy policy from time to time. We will notify you of any changes by:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Email notification</li>
                  <li>• In-app notification</li>
                  <li>• Updated date on this page</li>
                </ul>
                <p className="text-sm text-gray-600">
                  Last updated: January 15, 2024
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 