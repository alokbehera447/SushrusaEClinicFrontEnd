import React from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Users, Shield, Clock, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  const serviceFeatures = [
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your health information is protected with enterprise-grade security"
    },
    {
      icon: Users,
      title: "Licensed Providers",
      description: "All healthcare providers are licensed and verified professionals"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Access healthcare services anytime, anywhere"
    },
    {
      icon: Scale,
      title: "Legal Compliance",
      description: "Operating in full compliance with healthcare regulations"
    }
  ];

  const serviceTerms = [
    {
      title: "Platform Services",
      items: [
        "Video consultations with healthcare providers",
        "Digital prescription management",
        "Health record storage and access",
        "Appointment scheduling and management",
        "Payment processing for healthcare services",
        "Emergency support and triage"
      ]
    },
    {
      title: "User Responsibilities",
      items: [
        "Provide accurate and complete information",
        "Maintain the security of your account",
        "Use the platform for legitimate healthcare purposes",
        "Comply with applicable laws and regulations",
        "Respect the privacy of other users",
        "Report any security concerns immediately"
      ]
    }
  ];

  const prohibitedActivities = [
    "Sharing account credentials with others",
    "Attempting to access other users' accounts",
    "Using the platform for non-medical purposes",
    "Harassing or abusing healthcare providers",
    "Providing false or misleading information",
    "Attempting to reverse engineer the platform"
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
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-midnight">Terms of Service</h1>
                  <p className="text-gray-600">Last updated: January 2024</p>
                </div>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
              <Scale className="w-4 h-4 mr-1" />
              Legal Document
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Service Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {serviceFeatures.map((feature, index) => (
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
          {/* Left Column - Main Terms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Introduction */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Agreement to Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using SUSHRUSA eClinic platform, you agree to be bound by these Terms of Service. 
                  These terms govern your use of our healthcare platform and services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you do not agree to these terms, please do not use our platform. We reserve the right to modify 
                  these terms at any time, and your continued use constitutes acceptance of any changes.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Platform Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {serviceTerms.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-semibold text-midnight text-lg">{section.title}</h4>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
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

            {/* User Accounts */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">User Accounts & Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-midnight">Account Creation</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Provide accurate personal information</li>
                      <li>• Create a strong, unique password</li>
                      <li>• Verify your email address</li>
                      <li>• Complete your health profile</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-midnight">Account Security</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Keep credentials confidential</li>
                      <li>• Enable two-factor authentication</li>
                      <li>• Report suspicious activity</li>
                      <li>• Log out after each session</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Activities */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Prohibited Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  The following activities are strictly prohibited and may result in account termination:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prohibitedActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{activity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Payment & Billing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-midnight">Payment Methods</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Credit/Debit cards</li>
                      <li>• Digital wallets</li>
                      <li>• Insurance coverage</li>
                      <li>• Bank transfers</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-midnight">Billing Policies</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Transparent pricing</li>
                      <li>• No hidden fees</li>
                      <li>• Secure payment processing</li>
                      <li>• Detailed invoices</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Privacy & Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is paramount. We handle your health information in accordance with:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">HIPAA regulations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Data encryption</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Access controls</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Audit trails</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Regular backups</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Incident response</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  SUSHRUSA eClinic provides a platform for healthcare services but is not responsible for:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Medical advice or treatment outcomes</li>
                  <li>• Actions of healthcare providers</li>
                  <li>• Technical issues beyond our control</li>
                  <li>• User-generated content</li>
                  <li>• Third-party service disruptions</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Our liability is limited to the amount paid for services in the 12 months preceding any claim.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Legal Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#E17726]/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#E17726]" />
                    </div>
                    <div>
                      <p className="font-medium text-midnight">Legal Department</p>
                      <p className="text-sm text-gray-600">legal@sushrusa.com</p>
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
                  Contact Legal Team
                </Button>
              </CardContent>
            </Card>

            {/* Key Terms */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Key Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Acceptance required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Account security</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Payment terms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Liability limits</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Terms Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  We may update these terms periodically. You will be notified of significant changes through:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Email notification</li>
                  <li>• In-app alerts</li>
                  <li>• Updated date stamp</li>
                </ul>
                <p className="text-sm text-gray-600">
                  Last updated: January 15, 2024
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  These terms are governed by the laws of the jurisdiction where SUSHRUSA eClinic operates.
                </p>
                <p className="text-sm text-gray-700">
                  Any disputes will be resolved through binding arbitration in accordance with our dispute resolution policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 