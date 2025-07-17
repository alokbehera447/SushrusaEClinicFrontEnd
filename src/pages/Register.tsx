import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, Phone, Shield, Clock, CheckCircle, ArrowRight, User, Calendar } from 'lucide-react';
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
      await api.post('/api/auth/send-otp/', { phone: phoneNumber });
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
      const res = await api.post('/api/auth/verify-otp/', { phone: phoneNumber, otp: otpString });
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
      await api.post('/api/auth/send-otp/', { phone: phoneNumber });
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
      case 'phone': return 'We\'ll send you a secure verification code';
      case 'info': return 'Help us personalize your experience';
      case 'otp': return `Verification code sent to ${phoneNumber}`;
      default: return 'Create your account';
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #f3e8ff 100%)'
      }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-[#E17726] p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-md">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-midnight">SUSHRUSA</span>
                <span className="text-xs sm:text-sm text-gray-500 ml-1">eClinic</span>
              </div>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-gray-300 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-10">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-midnight mb-2">Join Sushrusa eClinic</h2>
            <p className="text-gray-600 text-base sm:text-lg">Your journey to better health starts here</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
            {['phone', 'info', 'otp'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                  step === stepName 
                    ? 'bg-[#E17726] text-white' 
                    : step === 'info' && stepName === 'phone' || step === 'otp' && ['phone', 'info'].includes(stepName)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step === 'info' && stepName === 'phone' || step === 'otp' && ['phone', 'info'].includes(stepName) ? (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 ${
                    step === 'info' && stepName === 'phone' || step === 'otp' && ['phone', 'info'].includes(stepName)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl text-center text-midnight">
                {getStepTitle()}
              </CardTitle>
              <CardDescription className="text-center text-gray-600 text-sm sm:text-base">
                {getStepDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'phone' && (
                <form onSubmit={handlePhoneSubmit} className="space-y-4 sm:space-y-6">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                        placeholder="Enter your phone number"
                        required
                        className="w-full pl-10"
                        maxLength={12}
                      />
                    </div>
                  </div>

                  {/* Test Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-blue-800 font-medium">Test OTP: <span className="font-mono bg-white px-1 rounded">123456</span></p>
                  </div>

                  <Button
                    type="submit"
                    disabled={phoneNumber.length !== 10 || isLoading}
                    className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base h-11 sm:h-12"
                  >
                    {isLoading ? "Verifying..." : "Send Verification Code"}
                  </Button>
                </form>
              )}

              {step === 'info' && (
                <form onSubmit={handleInfoSubmit} className="space-y-4 sm:space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          value={userInfo.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          value={userInfo.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                        Date of Birth *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={userInfo.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!userInfo.firstName || !userInfo.lastName || !userInfo.dateOfBirth || isLoading}
                    className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base h-11 sm:h-12"
                  >
                    {isLoading ? "Processing..." : "Continue to Verification"}
                  </Button>

                  {/* Back to Phone */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      ← Back to phone number
                    </button>
                  </div>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  {/* OTP Input */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Enter 6-digit OTP
                    </Label>
                    <div className="flex justify-center space-x-2 sm:space-x-3">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          className="w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-semibold"
                          maxLength={1}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-xs sm:text-sm text-gray-500">
                        Resend OTP in <span className="font-semibold text-[#E17726]">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-xs sm:text-sm text-[#E17726] hover:text-[#c9651e] font-medium"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={otp.join('').length !== 6 || isLoading}
                    className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base h-11 sm:h-12"
                  >
                    {isLoading ? "Setting up your account..." : "Complete Registration"}
                  </Button>

                  {/* Back to Info */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('info');
                        setOtpSent(false);
                        setOtp(['', '', '', '', '', '']);
                      }}
                      className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      ← Back to information
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#E17726] hover:text-[#c9651e] font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register; 