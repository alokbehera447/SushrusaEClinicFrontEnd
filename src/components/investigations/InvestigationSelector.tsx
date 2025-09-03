import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, X, Stethoscope, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
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
      toast({
        title: "Warning",
        description: "Please select at least one test",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const testsData = Array.from(selectedTests).map(testId => ({
        test_id: testId,
        ...investigationDetails[testId]
      }));

      const request: AddInvestigationRequest = {
        prescription_id: prescriptionId,
        tests: testsData
      };

      const newInvestigations = await investigationService.addInvestigationsToPrescription(request);
      
      // Reset form
      setSelectedTests(new Set());
      setInvestigationDetails({});
      setShowAddForm(false);
      
      // Notify parent component
      onInvestigationsUpdated(newInvestigations);
      
      toast({
        title: "Success",
        description: `${newInvestigations.length} investigation(s) added successfully`,
      });
    } catch (error) {
      console.error('Error adding investigations:', error);
      toast({
        title: "Error",
        description: "Failed to add investigations",
        variant: "destructive"
      });
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
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{test.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {test.code}
                            </Badge>
                            {test.is_fasting_required && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                Fasting Required
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                            <div>
                              <span className="font-medium">Normal Range:</span> {test.normal_range}
                            </div>
                            <div>
                              <span className="font-medium">Unit:</span> {test.unit}
                            </div>
                          </div>
                          
                          {test.preparation_instructions && (
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">Preparation:</span> {test.preparation_instructions}
                            </div>
                          )}
                          
                          {test.estimated_cost && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                              Estimated Cost: ₹{test.estimated_cost}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Investigation Details Form */}
                      {selectedTests.has(test.id) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor={`priority-${test.id}`}>Priority</Label>
                              <Select
                                value={investigationDetails[test.id]?.priority || 'routine'}
                                onValueChange={(value: 'routine' | 'urgent' | 'emergency') =>
                                  setInvestigationDetails(prev => ({
                                    ...prev,
                                    [test.id]: {
                                      ...prev[test.id],
                                      priority: value
                                    }
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="routine">Routine</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                  <SelectItem value="emergency">Emergency</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="md:col-span-2">
                              <Label htmlFor={`special-${test.id}`}>Special Instructions</Label>
                              <Input
                                id={`special-${test.id}`}
                                placeholder="Any special instructions for this test..."
                                value={investigationDetails[test.id]?.special_instructions || ''}
                                onChange={(e) =>
                                  setInvestigationDetails(prev => ({
                                    ...prev,
                                    [test.id]: {
                                      ...prev[test.id],
                                      special_instructions: e.target.value
                                    }
                                  }))
                                }
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`notes-${test.id}`}>Notes</Label>
                            <Textarea
                              id={`notes-${test.id}`}
                              placeholder="Additional notes..."
                              rows={2}
                              value={investigationDetails[test.id]?.notes || ''}
                              onChange={(e) =>
                                setInvestigationDetails(prev => ({
                                  ...prev,
                                  [test.id]: {
                                    ...prev[test.id],
                                    notes: e.target.value
                                  }
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Investigations */}
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
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(investigation.priority)}
                      <Badge className={priorityColors[investigation.priority]}>
                        {investigation.priority.charAt(0).toUpperCase() + investigation.priority.slice(1)}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">{investigation.test.name}</h4>
                      <p className="text-sm text-gray-600">{investigation.test.category.name}</p>
                      {investigation.special_instructions && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Instructions:</span> {investigation.special_instructions}
                        </p>
                      )}
                      {investigation.notes && (
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Notes:</span> {investigation.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {investigation.test.code}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
