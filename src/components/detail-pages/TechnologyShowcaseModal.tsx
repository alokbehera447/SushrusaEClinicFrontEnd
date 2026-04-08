import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cpu, Shield, Zap, Brain, Video, Smartphone, Cloud, ArrowRight, Sparkles, Play } from 'lucide-react';

interface TechnologyShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TechnologyShowcaseModal: React.FC<TechnologyShowcaseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('platform');

  if (!isOpen) return null;

  const technologies = [
    {
      id: 'platform',
      title: 'Telemedicine Platform',
      icon: <Video className="w-8 h-8 text-white" />,
      gradient: 'from-[#E17726] to-[#FF8A56]',
      description: 'State-of-the-art video consultation platform with HD quality and seamless connectivity.',
      features: [
        'HD Video & Audio Quality',
        'Multi-device Compatibility',
        'Real-time Screen Sharing',
        'Digital Prescription System',
        'Instant Notifications',
        'Automated Scheduling'
      ],
      benefits: [
        'Crystal clear consultations from anywhere',
        'Works on all devices - phone, tablet, laptop',
        'Secure and HIPAA-compliant infrastructure',
        'Integrated payment processing'
      ]
    },
    {
      id: 'ai',
      title: 'AI-Powered Diagnostics',
      icon: <Brain className="w-8 h-8 text-white" />,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Advanced artificial intelligence assists doctors in diagnosis and treatment recommendations.',
      features: [
        'Symptom Analysis Engine',
        'Medical Image Recognition',
        'Drug Interaction Checker',
        'Treatment Recommendation AI',
        'Risk Assessment Algorithms',
        'Predictive Health Analytics'
      ],
      benefits: [
        'More accurate diagnoses with AI assistance',
        'Faster treatment recommendations',
        'Early detection of health risks',
        'Personalized care plans'
      ]
    },
    {
      id: 'mobile',
      title: 'Mobile Health App',
      icon: <Smartphone className="w-8 h-8 text-white" />,
      gradient: 'from-cyan-500 to-blue-500',
      description: 'Comprehensive mobile application for complete healthcare management on the go.',
      features: [
        'Consultation Booking',
        'Health Records Storage',
        'Medication Reminders',
        'Appointment Calendar',
        'Symptom Tracker',
        'Emergency Services'
      ],
      benefits: [
        'Healthcare in your pocket',
        'Never miss appointments or medications',
        'Complete health history at fingertips',
        'Emergency help when needed'
      ]
    },
    {
      id: 'security',
      title: 'Advanced Security',
      icon: <Shield className="w-8 h-8 text-white" />,
      gradient: 'from-green-500 to-emerald-500',
      description: 'Military-grade security infrastructure protecting your sensitive health information.',
      features: [
        'End-to-End Encryption',
        'HIPAA Compliance',
        'Multi-Factor Authentication',
        'Secure Data Centers',
        'Regular Security Audits',
        'Zero-Trust Architecture'
      ],
      benefits: [
        'Complete data privacy and protection',
        'Compliance with healthcare regulations',
        'Secure authentication processes',
        'Regular security updates and monitoring'
      ]
    },
    {
      id: 'cloud',
      title: 'Cloud Infrastructure',
      icon: <Cloud className="w-8 h-8 text-white" />,
      gradient: 'from-orange-500 to-red-500',
      description: 'Scalable cloud infrastructure ensuring 99.9% uptime and global accessibility.',
      features: [
        '99.9% Uptime Guarantee',
        'Global CDN Network',
        'Auto-scaling Architecture',
        'Real-time Backup',
        'Disaster Recovery',
        'Load Balancing'
      ],
      benefits: [
        'Always available when you need it',
        'Fast loading times worldwide',
        'Automatic data backup and recovery',
        'Seamless scaling with user growth'
      ]
    },
    {
      id: 'performance',
      title: 'High Performance',
      icon: <Zap className="w-8 h-8 text-white" />,
      gradient: 'from-yellow-500 to-orange-500',
      description: 'Optimized performance delivering lightning-fast healthcare services.',
      features: [
        'Sub-second Response Times',
        'Edge Computing Network',
        'Smart Caching Systems',
        'Bandwidth Optimization',
        'Progressive Web App',
        'Offline Capabilities'
      ],
      benefits: [
        'Lightning-fast app performance',
        'Works even in low connectivity areas',
        'Smooth user experience',
        'Efficient resource utilization'
      ]
    }
  ];

  const activetech = technologies.find(tech => tech.id === activeTab) || technologies[0];

  const stats = [
    { number: '99.9%', label: 'Uptime Guarantee', icon: <Zap className="w-5 h-5 text-[#E17726]" /> },
    { number: '<1s', label: 'Response Time', icon: <Cpu className="w-5 h-5 text-[#E17726]" /> },
    { number: '256-bit', label: 'Encryption', icon: <Shield className="w-5 h-5 text-[#E17726]" /> },
    { number: '24/7', label: 'Monitoring', icon: <Brain className="w-5 h-5 text-[#E17726]" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#E17726]/10 to-cyan-400/10 p-8 pb-6">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full border border-[#E17726]/20 mb-6">
              <Sparkles className="w-5 h-5 text-[#E17726]" />
              <span className="text-sm font-bold text-[#E17726] tracking-wide">CUTTING-EDGE TECHNOLOGY</span>
              <Cpu className="w-5 h-5 text-cyan-600" />
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-midnight mb-4">
              Explore Our 
              <span className="block text-[#E17726]">Technology</span>
            </h2>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the advanced technology stack that powers SUSHRUSA's 
              healthcare platform and delivers exceptional patient experiences.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E17726]/20 to-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-midnight mb-1">{stat.number}</div>
                <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Technology Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {technologies.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => setActiveTab(tech.id)}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    activeTab === tech.id
                      ? 'bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tech.title}
                </button>
              ))}
            </div>

            {/* Active Technology Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Info */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${activetech.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    {activetech.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-midnight mb-2">{activetech.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{activetech.description}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-midnight mb-4">Key Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activetech.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-2 h-2 bg-gradient-to-r ${activetech.gradient} rounded-full mr-3`}></div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Benefits */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-midnight mb-4">Benefits for You</h4>
                  <div className="space-y-3">
                    {activetech.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demo/Preview Card */}
                <div className={`bg-gradient-to-br ${activetech.gradient} p-6 rounded-2xl text-white`}>
                  <h4 className="text-xl font-bold mb-3">See It In Action</h4>
                  <p className="mb-4 opacity-90">Experience our {activetech.title.toLowerCase()} with a live demo.</p>
                  <Button 
                    variant="outline" 
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-gray-900"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Section */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 mb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-midnight mb-6">Seamless Integration</h3>
              <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
                Our technology stack works together seamlessly to provide you with a unified, 
                smooth healthcare experience across all touchpoints.
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-6">
                {['Mobile App', 'Web Platform', 'Wearable Devices', 'EMR Systems', 'Payment Gateways', 'Lab Networks'].map((integration, index) => (
                  <div key={index} className="px-4 py-2 bg-white rounded-full shadow-soft border border-gray-200 text-sm font-medium text-gray-700">
                    {integration}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-midnight mb-4">Ready to Experience Advanced Healthcare?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of patients who trust our technology-driven healthcare platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:shadow-xl-colored text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105">
                Start Your Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-white border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500"
              >
                Download Mobile App
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyShowcaseModal;