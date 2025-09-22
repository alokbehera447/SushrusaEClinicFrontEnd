import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, X, Stethoscope, Clock, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import investigationService, { 
  InvestigationTest, 
  InvestigationCategory, 
  PrescriptionInvestigation,
  AddInvestigationRequest 
} from '@/services/investigationService';

interface InvestigationSelectorProps {
  prescriptionId: number;
  onInvestigationsUpdated: (investigations: PrescriptionInvestigation[]) => void;
  existingInvestigations?: PrescriptionInvestigation[];
}

const priorityColors = {
  routine: 'bg-blue-100 text-blue-800',
  urgent: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800'
};

const priorityIcons = {
  routine: CheckCircle,
  urgent: Clock,
  emergency: AlertTriangle
};

export default function InvestigationSelector({ 
  prescriptionId, 
  onInvestigationsUpdated,
  existingInvestigations = []
}: InvestigationSelectorProps) {
  const [categories, setCategories] = useState<InvestigationCategory[]>([]);
  const [tests, setTests] = useState<InvestigationTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<InvestigationTest[]>([]);
  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [investigationDetails, setInvestigationDetails] = useState<{
    [testId: number]: {
      priority: 'routine' | 'urgent' | 'emergency';
      special_instructions: string;
      notes: string;
    };
  }>({});

  useEffect(() => {
    loadInvestigations();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm, selectedCategory]);

  // Update internal state when existingInvestigations prop changes
  useEffect(() => {
    console.log('InvestigationSelector - existingInvestigations prop changed:', existingInvestigations);
  }, [existingInvestigations]);

  const loadInvestigations = async () => {
    try {
      setLoading(true);
      const [categoriesData, testsData] = await Promise.all([
        investigationService.getCategories(),
        investigationService.getTests()
      ]);
      setCategories(categoriesData);
      setTests(testsData);
    } catch (error) {
      console.error('Error loading investigations:', error);
      toast({
        title: "Error",
        description: "Failed to load investigation tests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = tests;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category.name === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTests(filtered);
  };

  const handleTestSelection = (testId: number, checked: boolean) => {
    const newSelected = new Set(selectedTests);
    if (checked) {
      newSelected.add(testId);
      // Initialize default values for new selection
      if (!investigationDetails[testId]) {
        setInvestigationDetails(prev => ({
          ...prev,
          [testId]: {
            priority: 'routine' as const,
            special_instructions: '',
            notes: ''
          }
        }));
      }
    } else {
      newSelected.delete(testId);
      // Remove details for deselected test
      setInvestigationDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[testId];
        return newDetails;
      });
    }
    setSelectedTests(newSelected);
  };

  const handleAddInvestigations = async () => {
    if (selectedTests.size === 0) {
      toast.error("Please select at least one test");
      return;
    }

    try {
      setLoading(true);
      const testsData = Array.from(selectedTests).map(testId => ({
        test_id: testId,
        priority: 'routine',
        special_instructions: '',
        notes: ''
      }));

      const request: AddInvestigationRequest = {
        prescription_id: prescriptionId,
        tests: testsData
      };

      const newInvestigations = await investigationService.addInvestigationsToPrescription(request);
      console.log('New investigations added:', newInvestigations);
      
      // Fetch all investigations for this prescription to get the complete list
      const allInvestigations = await investigationService.getPrescriptionInvestigations(prescriptionId);
      console.log('All investigations after adding:', allInvestigations);
      
      // Reset form
      setSelectedTests(new Set());
      setInvestigationDetails({});
      setShowAddForm(false);
      
      // Notify parent component with all investigations
      console.log('Calling onInvestigationsUpdated with:', allInvestigations);
      onInvestigationsUpdated(allInvestigations);
      
      toast.success(`${newInvestigations.length} investigation(s) added successfully`);
    } catch (error) {
      console.error('Error adding investigations:', error);
      toast.error("Failed to add investigations");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInvestigation = async (investigationId: number) => {
    try {
      setLoading(true);
      await investigationService.deleteInvestigation(investigationId);
      
      // Fetch updated investigations list
      const updatedInvestigations = await investigationService.getPrescriptionInvestigations(prescriptionId);
      
      // Notify parent component with updated investigations
      onInvestigationsUpdated(updatedInvestigations);
      
      toast.success('Investigation removed successfully');
    } catch (error) {
      console.error('Error removing investigation:', error);
      toast.error('Failed to remove investigation');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: 'routine' | 'urgent' | 'emergency') => {
    const IconComponent = priorityIcons[priority];
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Investigation Tests</h3>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "default"}
          size="sm"
        >
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showAddForm ? 'Cancel' : 'Add Tests'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Select Investigation Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Tests</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, code, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={handleAddInvestigations}
                  disabled={loading || selectedTests.size === 0}
                  className="w-full"
                >
                  {loading ? 'Adding...' : `Add ${selectedTests.size} Test(s)`}
                </Button>
              </div>
            </div>

            {/* Test List */}
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-white">
              {filteredTests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {loading ? 'Loading tests...' : 'No tests found matching your criteria'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTests.map(test => (
                    <div key={test.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`test-${test.id}`}
                          checked={selectedTests.has(test.id)}
                          onCheckedChange={(checked) => 
                            handleTestSelection(test.id, checked as boolean)
                          }
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{test.name}</h4>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Investigations */}
      {console.log('InvestigationSelector - existingInvestigations:', existingInvestigations)}
      {existingInvestigations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Current Investigations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingInvestigations.map(investigation => (
                <div key={investigation.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{investigation.test.code}</h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInvestigation(investigation.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Remove investigation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
