import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";

import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { api } from "../../lib/utils";
import { 
  User, 
  Phone, 
  Mail, 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Shield,
  Eye,
  UserPlus,
  Settings,
  Activity,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react';

// Types
interface Admin {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
  last_login: string | null;
  profile_picture?: string | null;
}

interface Stats {
  total_admins: { value: number; change: string };
  active_admins: { value: number; change: string };
  new_this_month: { value: number; change: string };
  avg_performance: { value: string; change: string };
}

interface ManageAdminsProps {
  isDarkMode?: boolean;
}

const ManageAdmins: React.FC<ManageAdminsProps> = ({ isDarkMode = false }) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Admin | null>(null);
  const [showView, setShowView] = useState<Admin | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Add state for delete confirmation dialog
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch stats
  useEffect(() => {
    setStatsLoading(true);
    api.get("/api/auth/superadmin/admins/stats/")
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  // Fetch admins with pagination, search, and filters
  useEffect(() => {
    fetchAdmins();
  }, [search, filterStatus, currentPage, pageSize]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      params.append('page', currentPage.toString());
      params.append('page_size', pageSize.toString());
      
      const response = await api.get(`/api/auth/superadmin/admins/?${params.toString()}`);
      
      // Handle the new paginated response format
      setAdmins(response.data.data.admins || []);
      setTotalAdmins(response.data.data.pagination.total_count || 0);
    } catch (err) {
      setError("Failed to load admins");
      setAdmins([]);
      setTotalAdmins(0);
    } finally {
      setLoading(false);
    }
  };

  // Populate edit form when admin is selected for editing
  useEffect(() => {
    if (showEdit) {
      setEditFormData({
        name: showEdit.name,
        email: showEdit.email,
        phone: showEdit.phone
      });
    }
  }, [showEdit]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCreate = () => {
    if (!createFormData.name || !createFormData.email || !createFormData.phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    api.post("/api/auth/superadmin/admins/", createFormData)
      .then(() => {
        toast({ title: "Admin created successfully" });
        setShowCreate(false);
        setCreateFormData({ name: '', email: '', phone: '' });
        fetchAdmins();
      })
      .catch((error) => {
        console.error('Create admin error:', error);
        toast({ title: "Failed to create admin", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = () => {
    if (!showEdit || !editFormData.name || !editFormData.email || !editFormData.phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    api.put(`/api/auth/superadmin/admins/${showEdit.id}/`, editFormData)
      .then(() => {
        toast({ title: "Admin updated successfully" });
        setShowEdit(null);
        setEditFormData({ name: '', email: '', phone: '' });
        fetchAdmins();
      })
      .catch((error) => {
        console.error('Update admin error:', error);
        toast({ title: "Failed to update admin", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  const handleDeactivate = (admin: Admin) => {
    setAdminToDelete(admin);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    
    try {
      setIsDeleting(true);
      await api.delete(`/api/auth/superadmin/admins/${adminToDelete.id}/`);
      
      toast({ title: "Admin deactivated successfully" });
      setShowDeleteDialog(false);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (error) {
      console.error('Delete admin error:', error);
      toast({ title: "Failed to deactivate admin", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return "bg-red-100 text-red-800";
    if (!isVerified) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return "Inactive";
    if (!isVerified) return "Pending";
    return "Active";
  };

  const filteredAdmins = admins.filter(admin => {
    if (filterStatus === 'active') return admin.is_active && admin.is_verified;
    if (filterStatus === 'inactive') return !admin.is_active;
    if (filterStatus === 'pending') return !admin.is_verified;
    return true;
  });

  // UI
  return (
    <div className="space-y-6">
            {/* Header with Stats */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Admin Management</h2>
        <Button 
          variant="outline"
          onClick={() => setShowCreate(true)}
          className="border-[#E17726] text-[#E17726] hover:bg-[#E17726] hover:text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Admin
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className={`border-0 shadow-lg rounded-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Total Admins</p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {statsLoading ? '...' : stats?.total_admins?.value || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E17726]/10 to-[#E17726]/5 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#E17726]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg rounded-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Active Admins</p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {statsLoading ? '...' : stats?.active_admins?.value || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg rounded-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>New This Month</p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {statsLoading ? '...' : stats?.new_this_month?.value || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg rounded-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Avg Performance</p>
                <p className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {statsLoading ? '...' : stats?.avg_performance?.value || '0%'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin List */}
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card className={`border-0 shadow-lg rounded-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : ''
        }`}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <Input
                  placeholder="Search admins..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`pl-10 transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''
                  }`}
                />
              </div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E17726] focus:border-transparent transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                }`}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Verification</option>
              </select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearch('');
                  setFilterStatus('');
                }}
                className={`transition-colors duration-300 ${
                  isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admins Table */}
        <Card className={`border-0 shadow-lg rounded-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : ''
        }`}>
          <CardHeader>
            <CardTitle className={`text-lg font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Admin Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>Loading admins...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>No admins found</p>
                </div>
              ) : (
                filteredAdmins.map((admin) => (
                  <div key={admin.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#E17726] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-semibold transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{admin.name}</h4>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>{admin.email}</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{admin.phone}</p>
                        <p className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          Joined: {new Date(admin.date_joined).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(admin.is_active, admin.is_verified)}>
                        {getStatusText(admin.is_active, admin.is_verified)}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowView(admin)}
                          className={`transition-colors duration-300 ${
                            isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowEdit(admin)}
                          className={`transition-colors duration-300 ${
                            isDarkMode ? 'border-blue-400 text-blue-300 hover:bg-blue-900/20' : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeactivate(admin)}
                          disabled={deactivating === admin.id}
                          className={`transition-colors duration-300 ${
                            isDarkMode ? 'border-red-400 text-red-300 hover:bg-red-900/20' : 'border-red-300 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {totalAdmins > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalAdmins)} of {totalAdmins} admins
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, Math.ceil(totalAdmins / pageSize)) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalAdmins / pageSize)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Create New Admin
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name *</label>
              <Input 
                placeholder="Admin Name" 
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <Input 
                type="email" 
                placeholder="admin@example.com" 
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone *</label>
              <Input 
                placeholder="+91 98765 43210" 
                value={createFormData.phone}
                onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreate(false);
                  setCreateFormData({ name: '', email: '', phone: '' });
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Admin"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={!!showEdit} onOpenChange={() => {
        setShowEdit(null);
        setEditFormData({ name: '', email: '', phone: '' });
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Edit Admin
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input 
                placeholder="Admin Name" 
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input 
                type="email" 
                placeholder="admin@example.com" 
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input 
                placeholder="+91 98765 43210" 
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEdit(null);
                  setEditFormData({ name: '', email: '', phone: '' });
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#E17726] hover:bg-[#c9651e] text-white"
                onClick={handleEdit}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Admin"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Admin Dialog */}
      <Dialog open={!!showView} onOpenChange={() => setShowView(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Admin Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900">{showView?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{showView?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{showView?.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Badge className={showView ? getStatusColor(showView.is_active, showView.is_verified) : ''}>
                {showView ? getStatusText(showView.is_active, showView.is_verified) : ''}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Date Joined</label>
              <p className="text-gray-900">
                {showView ? new Date(showView.date_joined).toLocaleDateString() : ''}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Login</label>
              <p className="text-gray-900">
                {showView?.last_login ? new Date(showView.last_login).toLocaleDateString() : 'Never'}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowView(null)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-600" />
              Delete Admin
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to deactivate <strong>{adminToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setAdminToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Admin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageAdmins; 