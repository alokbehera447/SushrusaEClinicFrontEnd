import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, Phone, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Dummy phone numbers for testing
  const dummyCredentials = {
    'super_admin': { phone: '9876543210', redirect: '/superadmin/dashboard' },
    'admin': { phone: '9876543211', redirect: '/admin/dashboard' },
    'doctor': { phone: '9876543212', redirect: '/doctor/dashboard' },
    'patient': { phone: '9876543213', redirect: '/patient/dashboard' }
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    // Pre-fill phone number when role is selected
    if (dummyCredentials[role as keyof typeof dummyCredentials]) {
      setPhoneNumber(dummyCredentials[role as keyof typeof dummyCredentials].phone);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setOtpSent(true);
      setStep('otp');
      setCountdown(30); // 30 seconds countdown
      setIsLoading(false);
    }, 1000);
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
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const roleCredentials = dummyCredentials[selectedRole as keyof typeof dummyCredentials];
      
      if (roleCredentials && phoneNumber === roleCredentials.phone && otpString === '123456') {
        // Simulate setting authentication token/state
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('phoneNumber', phoneNumber);
        navigate(roleCredentials.redirect);
      } else {
        alert('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
      }
      setIsLoading(false);
    }, 1000);
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
            <h2 className="text-2xl sm:text-3xl font-bold text-midnight mb-2">Welcome Back to Sushrusa</h2>
            <p className="text-gray-600 text-base sm:text-lg">Continue your health journey with us</p>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl text-center text-midnight">
                {step === 'phone' ? 'Sign In Securely' : 'Verify Your Identity'}
              </CardTitle>
              <CardDescription className="text-center text-gray-600 text-sm sm:text-base">
                {step === 'phone' 
                  ? 'We\'ll send you a secure verification code' 
                  : `Verification code sent to ${phoneNumber}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'phone' ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4 sm:space-y-6">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                      Role
                    </Label>
                    <Select value={selectedRole} onValueChange={handleRoleChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="patient">Patient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Mobile Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formatPhoneNumber(phoneNumber)}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\s/g, ''))}
                        placeholder="Enter your mobile number"
                        required
                        className="w-full pl-10"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Test Credentials Info */}
                  {selectedRole && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs sm:text-sm text-blue-800 font-medium">Demo Credentials:</p>
                      <p className="text-xs sm:text-sm text-blue-700">
                        Mobile: <span className="font-mono bg-white px-1 rounded">{dummyCredentials[selectedRole as keyof typeof dummyCredentials]?.phone}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">
                        Code: <span className="font-mono bg-white px-1 rounded">123456</span>
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!selectedRole || phoneNumber.length !== 10 || isLoading}
                    className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base h-11 sm:h-12"
                  >
                    {isLoading ? "Sending verification code..." : "Send Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  {/* OTP Input */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Enter verification code
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
                        Resend code in <span className="font-semibold text-[#E17726]">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-xs sm:text-sm text-[#E17726] hover:text-[#c9651e] font-medium"
                      >
                        Resend verification code
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={otp.join('').length !== 6 || isLoading}
                    className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base h-11 sm:h-12"
                  >
                    {isLoading ? "Verifying..." : "Sign In"}
                  </Button>

                  {/* Back to Phone */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setOtpSent(false);
                        setOtp(['', '', '', '', '', '']);
                      }}
                      className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      ← Back to sign in
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  New to Sushrusa?{' '}
                  <Link to="/register" className="text-[#E17726] hover:text-[#c9651e] font-medium">
                    Create your account
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

export default Login; 