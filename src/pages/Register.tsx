import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, Phone, Shield, Clock, CheckCircle, ArrowRight, User, Calendar, Smartphone, Lock, Users, Star } from 'lucide-react';
import { api } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'info' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Basic user info
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/api/auth/send-otp/', { 
        phone: phoneNumber,
        purpose: 'registration'
      });
      setStep('info');
    } catch (err) {
      setError('Failed to send OTP. Please check your number and try again.');
    }
    setIsLoading(false);
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('otp');
    setOtpSent(true);
    setCountdown(30);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // For registration, include user info
      const requestData = {
        phone: phoneNumber,
        otp: otpString,
        purpose: 'registration',
        user_info: {
          name: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
          date_of_birth: userInfo.dateOfBirth,
          role: 'patient'
        }
      };
      
      const res = await api.post('/api/auth/verify-otp/', requestData);
      if (res.data && res.data.success && res.data.data && res.data.data.user) {
        const user = res.data.data.user;
        const access = res.data.data.access;
        const refresh = res.data.data.refresh;
        login(user, access, refresh);
        navigate('/patient/dashboard');
      } else {
        setError('Invalid OTP or user.');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
    }
    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    setCountdown(30);
    setOtp(['', '', '', '', '', '']);
    try {
      await api.post('/api/auth/send-otp/', { 
        phone: phoneNumber,
        purpose: 'registration'
      });
    } catch {
      setError('Failed to resend OTP.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    // Allow up to 10 digits for Indian mobile numbers
    const limited = cleaned.slice(0, 10);
    const match = limited.match(/^(\d{0,5})(\d{0,5})$/);
    if (match) {
      return match[1] + (match[2] ? ' ' + match[2] : '');
    }
    return limited;
  };

  const getStepTitle = () => {
    switch (step) {
      case 'phone': return 'Get Started';
      case 'info': return 'Tell Us About You';
      case 'otp': return 'Verify Your Account';
      default: return 'Join Us';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'phone': return 'We\'ll send you a secure verification code via SMS';
      case 'info': return 'Help us personalize your healthcare experience';
      case 'otp': return `Verification code sent to ${phoneNumber}`;
      default: return 'Create your account';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'phone': return <Smartphone className="h-6 w-6" />;
      case 'info': return <User className="h-6 w-6" />;
      case 'otp': return <Lock className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-[#E17726]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-t from-purple-400/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-[#E17726] to-[#FF8A56] p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-gray-900">SUSHRUSA</span>
                <span className="text-sm text-gray-600 ml-1 font-medium">eClinic</span>
              </div>
            </Link>
            <Link to="/">
              <Button 
                variant="outline" 
                className="border-gray-300/50 bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white hover:border-[#E17726] hover:text-[#E17726] transition-all duration-300 px-4 py-2 h-10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md lg:max-w-lg space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#E17726] to-[#FF8A56] rounded-2xl shadow-lg mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              Join Sushrusa
              <span className="block text-[#E17726]">eClinic Today</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-sm mx-auto">
              Your journey to better health starts with a simple registration
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            {['phone', 'info', 'otp'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === stepName 
                    ? 'bg-gradient-to-br from-[#E17726] to-[#FF8A56] text-white shadow-lg scale-110' 
                    : step === 'info' && stepName === 'phone' || step === 'otp' && ['phone', 'info'].includes(stepName)
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step === 'info' && stepName === 'phone' || step === 'otp' && ['phone', 'info'].includes(stepName) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                    step === 'info' && stepName === 'phone' || step === 'otp' && ['phone', 'info'].includes(stepName)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Registration Card */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="space-y-3 pb-6 pt-8">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E17726]/10 to-[#FF8A56]/10 rounded-xl flex items-center justify-center">
                  {getStepIcon()}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                {getStepTitle()}
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {getStepDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {step === 'phone' && (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  {/* Phone Number Input */}
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobile Number
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#E17726] transition-colors duration-300" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={formatPhoneNumber(phoneNumber)}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, '');
                          if (cleaned.length <= 10) {
                            setPhoneNumber(cleaned);
                          }
                        }}
                        placeholder="Enter your 10-digit mobile number"
                        required
                        className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-[#E17726] focus:ring-4 focus:ring-[#E17726]/10 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        maxLength={12}
                      />
                    </div>
                  </div>



                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={phoneNumber.length !== 10 || isLoading}
                    className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Send Verification Code
                      </div>
                    )}
                  </Button>
                  
                  {error && (
                    <div className="flex items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                      <Shield className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                      <div className="text-sm text-red-800">
                        {error}
                      </div>
                    </div>
                  )}
                </form>
              )}

              {step === 'info' && (
                <form onSubmit={handleInfoSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={userInfo.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Enter first name"
                          required
                          className="w-full px-4 py-4 text-lg border-2 border-gray-200 focus:border-[#E17726] focus:ring-4 focus:ring-[#E17726]/10 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={userInfo.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Enter last name"
                          required
                          className="w-full px-4 py-4 text-lg border-2 border-gray-200 focus:border-[#E17726] focus:ring-4 focus:ring-[#E17726]/10 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Date of Birth
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-[#E17726] transition-colors duration-300" />
                        </div>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={userInfo.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          required
                          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-[#E17726] focus:ring-4 focus:ring-[#E17726]/10 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!userInfo.firstName || !userInfo.lastName || !userInfo.dateOfBirth || isLoading}
                    className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Continue to Verification
                      </div>
                    )}
                  </Button>

                  {/* Back to Phone */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 flex items-center justify-center mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to phone number
                    </button>
                  </div>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  {/* OTP Input */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center justify-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Enter 6-digit verification code
                    </Label>
                    <div className="flex justify-center space-x-3">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 focus:border-[#E17726] focus:ring-4 focus:ring-[#E17726]/10 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          maxLength={1}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        Resend code in <span className="font-semibold text-[#E17726] ml-1">{countdown}s</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-sm text-[#E17726] hover:text-[#c9651e] font-semibold transition-colors duration-300 flex items-center justify-center mx-auto"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Resend verification code
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={otp.join('').length !== 6 || isLoading}
                    className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Setting up your account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Complete Registration
                      </div>
                    )}
                  </Button>
                  
                  {error && (
                    <div className="flex items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                      <Shield className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                      <div className="text-sm text-red-800">
                        {error}
                      </div>
                    </div>
                  )}

                  {/* Back to Info */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('info');
                        setOtpSent(false);
                        setOtp(['', '', '', '', '', '']);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 flex items-center justify-center mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to information
                    </button>
                  </div>
                </form>
              )}

              {/* Login Link */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#E17726] hover:text-[#c9651e] font-semibold transition-colors duration-300">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="text-center space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>24/7 Access</span>
              </div>
              <div className="flex items-center justify-center">
                <Star className="w-4 h-4 mr-2" />
                <span>Expert Care</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 