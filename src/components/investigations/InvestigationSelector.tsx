import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  showAddForm?: boolean;
  onShowAddFormChange?: (show: boolean) => void;
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
  existingInvestigations = [],
  showAddForm = false,
  onShowAddFormChange
}: InvestigationSelectorProps) {
  const [categories, setCategories] = useState<InvestigationCategory[]>([]);
  const [tests, setTests] = useState<InvestigationTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<InvestigationTest[]>([]);
  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
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
      
      // Reset form and close modal
      setSelectedTests(new Set());
      setInvestigationDetails({});
      setSearchTerm('');
      setSelectedCategory('all');
      onShowAddFormChange?.(false);
      
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

      {/* Investigation Tests Modal */}
      <Dialog open={showAddForm} onOpenChange={(open) => onShowAddFormChange?.(open)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              Add Investigation Tests
            </DialogTitle>
            <DialogDescription className="text-sm">
              Search and select multiple investigation tests to add to the prescription.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="search" className="text-sm">Search Tests</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, code, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category" className="text-sm">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9">
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
            </div>

            {/* Selected Tests Preview */}
            {selectedTests.size > 0 && (
              <div className="border rounded-lg p-3 bg-blue-50">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Tests ({selectedTests.size})</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from(selectedTests).map(testId => {
                    const test = tests.find(t => t.id === testId);
                    return test ? (
                      <Badge key={testId} variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-800">
                        {test.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Test List */}
            <div className="max-h-80 overflow-y-auto border rounded-lg p-3 bg-white">
              {filteredTests.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  {loading ? 'Loading tests...' : 'No tests found matching your criteria'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTests.map(test => (
                    <div key={test.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id={`test-${test.id}`}
                          checked={selectedTests.has(test.id)}
                          onCheckedChange={(checked) => 
                            handleTestSelection(test.id, checked as boolean)
                          }
                          className="mt-0.5"
                        />
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{test.name}</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {selectedTests.size} test(s) selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onShowAddFormChange?.(false);
                  setSelectedTests(new Set());
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddInvestigations}
                disabled={loading || selectedTests.size === 0}
                className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
              >
                {loading ? 'Adding...' : `Add ${selectedTests.size} Test(s)`}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Existing Investigations */}
      {existingInvestigations.length > 0 && (
        <div className="space-y-2">
          {existingInvestigations.map(investigation => (
            <div key={investigation.id} className="flex items-center justify-between p-2 border border-slate-200 rounded bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="p-0.5 bg-blue-100 rounded">
                  <Stethoscope className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-xs">{investigation.test.name}</h4>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveInvestigation(investigation.id)}
                disabled={loading}
                className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Remove investigation"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
