import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, Phone, Shield, Clock, CheckCircle, ArrowRight, Eye, EyeOff, Lock, User, Smartphone } from 'lucide-react';
import axios from 'axios';
import { api } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, isLoading } = useAuth();
  
  // Get return URL and message from location state
  const returnUrl = location.state?.returnUrl || '/';
  const message = location.state?.message;
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [accountTypeError, setAccountTypeError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dummy phone numbers for testing
  const dummyCredentials = {
    'super_admin': { phone: '9876543210', redirect: '/superadmin/dashboard' },
    'admin': { phone: '9876543211', redirect: '/admin/dashboard' },
    'doctor': { phone: '9876543212', redirect: '/doctor/dashboard' },
    'patient': { phone: '9876543213', redirect: '/patient/dashboard' }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // If there's a return URL, use it; otherwise use role-based redirect
      if (returnUrl && returnUrl !== '/') {
        navigate(returnUrl);
      } else if (user.role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, returnUrl]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    // Only check if phone number is 10 digits
    if (phoneNumber.length === 10) {
      const fetchAccountType = async () => {
        try {
          setAccountType(null);
          setAccountTypeError(null);
          const res = await api.get(
            `/api/auth/account-type/?phone=${phoneNumber}`
          );
          if (res.data && res.data.success && res.data.data && res.data.data.role) {
            setAccountType(res.data.data.role);
          } else {
            setAccountType(null);
          }
        } catch (err: unknown) {
          setAccountType(null);
          // Type guard for axios error
          if (
            typeof err === 'object' &&
            err !== null &&
            'response' in err &&
            typeof (err as { response?: { status?: number } }).response === 'object' &&
            (err as { response?: { status?: number } }).response?.status === 404
          ) {
            setAccountTypeError('No account found for this mobile number.');
          } else {
            setAccountTypeError('Could not check account type.');
          }
        }
      };
      fetchAccountType();
    } else {
      setAccountType(null);
      setAccountTypeError(null);
    }
  }, [phoneNumber]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E17726] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await api.post('/api/auth/send-otp/', { phone: phoneNumber });
      setOtpSent(true);
      setStep('otp');
      setCountdown(30); // 30 seconds countdown
    } catch (err: unknown) {
      // Handle specific error messages from backend
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = (err as any).response;
        if (response?.data?.error?.message) {
          setLoginError(response.data.error.message);
        } else {
          setLoginError('Failed to send OTP. Please check your number and try again.');
        }
      } else {
        setLoginError('Failed to send OTP. Please check your number and try again.');
      }
    }
    setIsSubmitting(false);
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
      setLoginError('Please enter a valid 6-digit OTP');
      return;
    }
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const res = await api.post('/api/auth/verify-otp/', { phone: phoneNumber, otp: otpString });
      if (res.data && res.data.success && res.data.data && res.data.data.user) {
        const user = res.data.data.user;
        const access = res.data.data.access;
        const refresh = res.data.data.refresh;
        login(user, access, refresh);
        // Redirect based on return URL or role
        if (returnUrl && returnUrl !== '/') {
          navigate(returnUrl);
        } else if (user.role === 'superadmin') {
          navigate('/superadmin/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      } else {
        setLoginError('Invalid OTP or user.');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err: unknown) {
      // Handle specific error messages from backend
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = (err as any).response;
        if (response?.data?.error?.message) {
          setLoginError(response.data.error.message);
        } else {
          setLoginError('Invalid OTP. Please try again.');
        }
      } else {
        setLoginError('Invalid OTP. Please try again.');
      }
      setOtp(['', '', '', '', '', '']);
    }
    setIsSubmitting(false);
  };

  const handleResendOtp = () => {
    setCountdown(30);
    setOtp(['', '', '', '', '', '']);
    // Simulate resending OTP
    alert('OTP resent successfully!');
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,5})(\d{0,5})$/);
    if (match) {
      return match[1] + (match[2] ? ' ' + match[2] : '');
    }
    return cleaned;
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              Welcome Back to
              <span className="block text-[#E17726]">Sushrusa eClinic</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-sm mx-auto">
              Continue your health journey with secure, instant access
            </p>
            {message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 text-sm font-medium">{message}</p>
              </div>
            )}
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="space-y-2 pb-6 pt-8">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                {step === 'phone' ? 'Secure Sign In' : 'Verify Your Identity'}
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {step === 'phone' 
                  ? 'We\'ll send you a secure verification code via SMS' 
                  : `Verification code sent to ${phoneNumber}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {step === 'phone' ? (
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
                    
                    {/* Account Type Message */}
                    {accountType && (
                      <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <div className="text-sm text-green-800">
                          <span className="font-semibold">Account Found:</span> 
                          <span className="ml-1 capitalize">{accountType.replace('_', ' ')}</span>
                        </div>
                      </div>
                    )}
                    {accountTypeError && (
                      <div className="flex items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                        <Shield className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          {accountTypeError}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={phoneNumber.length !== 10 || isSubmitting}
                    className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Sending verification code...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Send Verification Code
                      </div>
                    )}
                  </Button>
                  
                  {loginError && (
                    <div className="flex items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                      <Shield className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                      <div className="text-sm text-red-800">
                        {loginError}
                      </div>
                    </div>
                  )}
                </form>
              ) : (
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
                    disabled={otp.join('').length !== 6 || isSubmitting}
                    className="w-full bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:from-[#c9651e] hover:to-[#e67e22] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Sign In Securely
                      </div>
                    )}
                  </Button>
                  
                  {loginError && (
                    <div className="flex items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                      <Shield className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                      <div className="text-sm text-red-800">
                        {loginError}
                      </div>
                    </div>
                  )}

                  {/* Back to Phone */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtpSent(false);
                        setOtp(['', '', '', '', '', '']);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 flex items-center justify-center mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to sign in
                    </button>
                  </div>
                </form>
              )}

              {/* Registration Link */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  New to Sushrusa?{' '}
                  <Link to="/register" className="text-[#E17726] hover:text-[#c9651e] font-semibold transition-colors duration-300">
                    Create your account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 