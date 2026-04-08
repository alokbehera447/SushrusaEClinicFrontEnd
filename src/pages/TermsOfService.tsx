import React from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Users, Shield, Clock, Scale, MapPin, Phone, Mail } from 'lucide-react';
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
                  <h1 className="text-2xl font-bold text-midnight">Terms and Conditions</h1>
                  <p className="text-gray-600">Sushrusa Healthcare & Research Center</p>
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
                <CardTitle className="text-xl font-bold text-midnight">1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Welcome to Sushrusa Healthcare & Research Center. These terms and conditions outline the rules
                  and regulations for the use of our services. By accessing this center and using our services, you
                  agree to comply with and be bound by the following terms and conditions.
                </p>
              </CardContent>
            </Card>

            {/* Services Provided */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">2. Services Provided</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Sushrusa Healthcare & Research Center offers a range of medical services, including but not
                  limited to:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#E17726] rounded-full mt-2 flex-shrink-0"></div>
                    <span>General healthcare consultations</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#E17726] rounded-full mt-2 flex-shrink-0"></div>
                    <span>Specialized medical treatments</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#E17726] rounded-full mt-2 flex-shrink-0"></div>
                    <span>Research-based healthcare solutions</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#E17726] rounded-full mt-2 flex-shrink-0"></div>
                    <span>E-Clinic services for online consultations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Appointment and Consultation */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">3. Appointment and Consultation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">3.1 Scheduling Appointments</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Appointments can be scheduled online, via phone, or in person. We
                      recommend booking in advance to ensure availability.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">3.2 Consultation Fees</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Fees for consultations and treatments must be paid at the time of service.
                      Our fee structure is available upon request.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">3.3 E-Clinic Services</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Online consultations are available through our E-Clinic platform. You must
                      have a stable internet connection and necessary devices to participate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* No Refund Policy */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">4. No Refund Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">4.1 Consultation Fees</h4>
                    <p className="text-gray-700 leading-relaxed">
                      All consultation fees are non-refundable. Once a service is provided, the
                      payment cannot be refunded under any circumstances.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">4.2 Treatment Packages</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Fees for treatment packages are also non-refundable. In cases of
                      discontinuation, only residual services that have not been utilized will be available to the patient.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy and Confidentiality */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">5. Privacy and Confidentiality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">5.1 Patient Information</h4>
                    <p className="text-gray-700 leading-relaxed">
                      All patient information is confidential and will be handled according to
                      our privacy policy.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">5.2 Data Protection</h4>
                    <p className="text-gray-700 leading-relaxed">
                      We adhere to strict data protection protocols to ensure the safety and privacy
                      of patient data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liability */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">6. Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">6.1 Medical Advice</h4>
                    <p className="text-gray-700 leading-relaxed">
                      All medical advice provided by our healthcare professionals is based on their
                      expertise and available information. Patients are advised to follow the given recommendations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">6.2 Limitation of Liability</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Sushrusa Healthcare & Research Center will not be liable for any
                      direct, indirect, incidental, or consequential damages arising from the use of our services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Participation */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">7. Research Participation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">7.1 Voluntary Participation</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Participation in research studies is voluntary. Participants will be
                      provided with detailed information about the study and must provide informed consent.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-midnight mb-2">7.2 Confidentiality</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Data collected during research will be anonymized and used strictly for
                      research purposes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-midnight">8. Changes to Terms and Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Sushrusa Healthcare & Research Center reserves the right to update or modify these terms and
                  conditions at any time. Any changes will be communicated to patients and posted on our website.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Information */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">9. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 mb-4">
                  For any questions or concerns regarding these terms and conditions, please contact us at:
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#E17726]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-[#E17726]" />
                    </div>
                    <div>
                      <p className="font-medium text-midnight">Address</p>
                      <p className="text-sm text-gray-600">
                        HIG 11, 2ND LANE, near Kharavel park, Phase I, Khandagiri, Bhubaneswar, Odisha 751030
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#E17726]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-[#E17726]" />
                    </div>
                    <div>
                      <p className="font-medium text-midnight">Phone</p>
                      <p className="text-sm text-gray-600">+91 6370 511 060</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#E17726]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-[#E17726]" />
                    </div>
                    <div>
                      <p className="font-medium text-midnight">Email</p>
                      <p className="text-sm text-gray-600">care@sushrusahealthcare.co</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white">
                  Contact Us
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
                    <span className="text-sm text-gray-700">Non-refundable fees</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Confidential patient data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">E-Clinic services available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Research participation voluntary</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Important Notice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">No Refund Policy</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        All consultation fees and treatment packages are non-refundable once services are provided.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Areas */}
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-midnight">Service Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  We provide healthcare services including:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• General healthcare consultations</li>
                  <li>• Specialized medical treatments</li>
                  <li>• Research-based healthcare solutions</li>
                  <li>• E-Clinic online consultations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 