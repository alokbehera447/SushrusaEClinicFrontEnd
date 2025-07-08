import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dummy credentials for testing
  const dummyCredentials = {
    'super_admin': { username: 'superadmin', password: 'test@123', redirect: '/superadmin/dashboard' },
    'admin': { username: 'admin_ecenter1', password: 'test@123', redirect: '/admin/dashboard' },
    'doctor': { username: 'dr_ramesh', password: 'test@123', redirect: '/doctor/dashboard' },
    'patient': { username: 'john_patient', password: 'test@123', redirect: '/patient/dashboard' }
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    // Pre-fill username when role is selected
    if (dummyCredentials[role as keyof typeof dummyCredentials]) {
      setUsername(dummyCredentials[role as keyof typeof dummyCredentials].username);
      setPassword(''); // Clear password for security
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const roleCredentials = dummyCredentials[selectedRole as keyof typeof dummyCredentials];
      
      if (roleCredentials && username === roleCredentials.username && password === roleCredentials.password) {
        // Simulate setting authentication token/state
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('username', username);
        navigate(roleCredentials.redirect);
      } else {
        alert('Invalid credentials. Please check your username and password.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-[#E17726] p-2 rounded-xl shadow-md">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-midnight">SUSHRUSA</span>
                <span className="text-sm text-gray-500 ml-1">eClinic</span>
              </div>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-midnight mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center text-midnight">Sign In</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Choose your role and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Select Role
                  </Label>
                  <Select value={selectedRole} onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="w-full"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Test Credentials Info */}
                {selectedRole && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 font-medium">Test Credentials:</p>
                    <p className="text-sm text-blue-700">
                      Username: <span className="font-mono bg-white px-1 rounded">{dummyCredentials[selectedRole as keyof typeof dummyCredentials]?.username}</span>
                    </p>
                    <p className="text-sm text-blue-700">
                      Password: <span className="font-mono bg-white px-1 rounded">test@123</span>
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!selectedRole || !username || !password || isLoading}
                  className="w-full bg-[#E17726] hover:bg-[#c9651e] text-white py-2 px-4 rounded-lg font-medium text-base h-11"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#E17726] hover:text-[#c9651e] font-medium">
                    Register here
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