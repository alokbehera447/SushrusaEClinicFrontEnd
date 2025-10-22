import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Trash2, Pill, MessageSquare, Edit3 } from 'lucide-react';
import { medicationService, type MedicationSearchResult } from '@/services/medicationService';

// Common dosage patterns for dropdown
const DOSAGE_PATTERNS = [
  { value: '0-0-1', label: '0-0-1 (Bedtime only)' },
  { value: '1-0-0', label: '1-0-0 (Morning only)' },
  { value: '0-1-0', label: '0-1-0 (Afternoon only)' },
  { value: '1-0-1', label: '1-0-1 (Morning & Evening)' },
  { value: '1-1-0', label: '1-1-0 (Morning & Afternoon)' },
  { value: '0-1-1', label: '0-1-1 (Afternoon & Evening)' },
  { value: '1-1-1', label: '1-1-1 (Three times daily)' },
  { value: '2-0-0', label: '2-0-0 (2x Morning)' },
  { value: '0-0-2', label: '0-0-2 (2x Evening)' },
  { value: '2-1-2', label: '2-1-2 (5 times daily)' },
  { value: '1-1-1-1', label: '1-1-1-1 (Four times daily)' },
];

// Helper function to parse dosage pattern and set individual doses
const parseDosagePattern = (pattern: string) => {
  const parts = pattern.split('-');
  return {
    morning_dose: parseInt(parts[0]) || 0,
    afternoon_dose: parseInt(parts[1]) || 0,
    evening_dose: parseInt(parts[2]) || 0,
  };
};

// Helper function to get dosage pattern from individual doses
const getDosagePattern = (morning: number, afternoon: number, evening: number) => {
  return `${morning}-${afternoon}-${evening}`;
};

import { toast } from 'sonner';

interface Medication {
  id?: number;
  medicine_name: string;
  composition?: string;
  dosage_form?: string;
  dosage?: string;
  morning_dose?: number;
  afternoon_dose?: number;
  evening_dose?: number;
  frequency: 'once_daily' | 'twice_daily' | 'thrice_daily' | 'four_times_daily' | 'sos' | 'custom';
  custom_frequency?: string;
  timing: 'with_food' | 'before_breakfast' | 'empty_stomach' | 'bedtime' | 'after_breakfast' | 'before_lunch' | 'after_lunch' | 'before_dinner' | 'after_dinner' | 'custom';
  custom_timing?: string;
  timing_display_text?: string;
  duration_days?: number;
  duration_weeks?: number;
  duration_months?: number;
  is_continuous?: boolean;
  special_instructions?: string;
  notes?: string;
  before_meal?: boolean;
  is_generic?: boolean;
  order?: number;
}

interface EnhancedMedicationTableProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medications: Medication[]) => Promise<void>;
  consultationId: string;
  existingMedications?: Medication[];
}

const EnhancedMedicationTable: React.FC<EnhancedMedicationTableProps> = React.memo(({
  isOpen,
  onClose,
  onSave,
  consultationId,
  existingMedications = []
}) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchResults, setSearchResults] = useState<{ [key: number]: MedicationSearchResult[] }>({});
  const [activeSearchRow, setActiveSearchRow] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState<{ [key: number]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedInstructionsRow, setExpandedInstructionsRow] = useState<number | null>(null);
  const [isCreatingMedication, setIsCreatingMedication] = useState<{ [key: number]: boolean }>({});
  const searchTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [dropdownPosition, setDropdownPosition] = useState<{ [key: number]: { top: number; left: number; width: number } }>({});
  const inputRefs = useRef<{ [key: number]: HTMLInputElement }>({});
  const previousIsOpenRef = useRef(isOpen);
  const initialMedicationCountRef = useRef(0);

  const addNewRow = useCallback(() => {
    const newMedication: Medication = {
      medicine_name: '',
      frequency: 'once_daily',
      timing: 'with_food',
      duration_days: 0,
      morning_dose: 0,
      afternoon_dose: 0,
      evening_dose: 0,
      special_instructions: ''
    };
    setMedications(prev => [...prev, newMedication]);
  }, []);

  // Initialize with existing medications or empty row - only when dialog opens
  useEffect(() => {
    // Only initialize when dialog transitions from closed to open
    if (isOpen && !previousIsOpenRef.current) {
      // Track how many medications existed when we opened the dialog
      const initialCount = existingMedications.length;
      initialMedicationCountRef.current = initialCount;
      
      console.log('🎬 Dialog opening - initializing medications:', {
        existingCount: initialCount,
        existingMedications: existingMedications.map(m => ({ id: m.id, name: m.medicine_name }))
      });
      
      if (existingMedications.length > 0) {
        // Add existing medications plus one empty row for new entries
        setMedications([...existingMedications, {
          medicine_name: '',
          composition: '',
          dosage_form: 'tablet',
          morning_dose: 0,
          afternoon_dose: 0,
          evening_dose: 0,
          frequency: 'once_daily' as const,
          timing: 'with_food' as const,
          duration_days: 0,
          duration_weeks: 0,
          duration_months: 0,
          is_continuous: false,
          special_instructions: ''
        }]);
      } else {
        setMedications([{
          medicine_name: '',
          composition: '',
          dosage_form: 'tablet',
          morning_dose: 0,
          afternoon_dose: 0,
          evening_dose: 0,
          frequency: 'once_daily' as const,
          timing: 'with_food' as const,
          duration_days: 0,
          duration_weeks: 0,
          duration_months: 0,
          is_continuous: false,
          special_instructions: ''
        }]);
      }
      // Reset search states when dialog opens
      setSearchResults({});
      setActiveSearchRow(null);
      setDropdownPosition({});
      setIsSearching({});
      setIsCreatingMedication({});
    }
    
    // Update the ref to track current state
    previousIsOpenRef.current = isOpen;
  }, [isOpen, existingMedications]); // Run when dialog state or existingMedications changes

  // Sync medications when existingMedications change (e.g., after API load)
  useEffect(() => {
    if (!isOpen) return;
    if (existingMedications.length === 0) return;

    const newExistingCount = existingMedications.length;
    const previousCount = initialMedicationCountRef.current;

    // Avoid overriding user input: if user has started typing in any new row, skip sync
    const hasUserInput = medications.some(m => !m.id && (
      (m.medicine_name && m.medicine_name.trim().length > 0) ||
      (m.morning_dose && m.morning_dose > 0) ||
      (m.afternoon_dose && m.afternoon_dose > 0) ||
      (m.evening_dose && m.evening_dose > 0) ||
      (m.special_instructions && m.special_instructions.trim().length > 0)
    ));

    if (newExistingCount !== previousCount && !hasUserInput) {
      console.log('🔄 Syncing medications in EnhancedMedicationTable (post-load):', {
        previousCount,
        newExistingCount,
        existingMedications: existingMedications.map(med => ({
          id: med.id,
          name: med.medicine_name,
          timing: med.timing,
          duration_days: med.duration_days,
          special_instructions: med.special_instructions
        }))
      });

      setMedications([
        ...existingMedications,
        {
          medicine_name: '',
          composition: '',
          dosage_form: 'tablet',
          morning_dose: 0,
          afternoon_dose: 0,
          evening_dose: 0,
          frequency: 'once_daily' as const,
          timing: 'with_food' as const,
          duration_days: 7,
          duration_weeks: 0,
          duration_months: 0,
          is_continuous: false,
          special_instructions: ''
        }
      ]);
      // DON'T update initialMedicationCountRef here - it should only be set when dialog opens
      // initialMedicationCountRef.current = newExistingCount; // REMOVED
    }
  }, [existingMedications, isOpen]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const currentTimeouts = searchTimeoutRef.current;
    return () => {
      Object.values(currentTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeSearchRow !== null) {
        const target = event.target as Element;
        // Only close if clicking outside both the dropdown and the input field
        if (!target.closest('.search-dropdown-portal') && !target.closest(`[data-row-index="${activeSearchRow}"]`)) {
          setActiveSearchRow(null);
          setDropdownPosition(prev => {
            const newPositions = { ...prev };
            delete newPositions[activeSearchRow];
            return newPositions;
          });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeSearchRow]);

  const removeRow = useCallback((index: number) => {
    setMedications(prev => {
      // Close any open search dropdown to avoid overlay issues
      setActiveSearchRow(null);
      
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      
      // If this is the only row, reset it to a blank medication row
      const blankMedication: Medication = {
        medicine_name: '',
        frequency: 'once_daily',
        timing: 'with_food',
        duration_days: 7,
        morning_dose: 0,
        afternoon_dose: 0,
        evening_dose: 0,
        special_instructions: ''
      };
      return [blankMedication];
    });
  }, []);

  // Ensure the medication input stays focusable when opening the search dropdown
  useEffect(() => {
    if (activeSearchRow !== null) {
      setTimeout(() => {
        const inputElement = inputRefs.current[activeSearchRow];
        if (inputElement) inputElement.focus();
      }, 0);
    }
  }, [activeSearchRow]);

  const updateMedication = useCallback((index: number, field: keyof Medication, value: string | number | boolean) => {
    setMedications(prev => {
      const newMedications = [...prev];
      newMedications[index] = { ...newMedications[index], [field]: value };
      return newMedications;
    });
  }, []);

  const handleMedicationSearch = useCallback((query: string, rowIndex: number) => {
    // Clear existing timeout for this row
    if (searchTimeoutRef.current[rowIndex]) {
      clearTimeout(searchTimeoutRef.current[rowIndex]);
    }

    if (query.length < 2) {
      setSearchResults(prev => ({ ...prev, [rowIndex]: [] }));
      return;
    }

    // Set loading state immediately
    setIsSearching(prev => ({ ...prev, [rowIndex]: true }));
    setActiveSearchRow(rowIndex);

    // Calculate dropdown position
    const inputElement = inputRefs.current[rowIndex];
    if (inputElement) {
      const rect = inputElement.getBoundingClientRect();
      setDropdownPosition(prev => ({
        ...prev,
        [rowIndex]: {
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        }
      }));
    }

    // Debounce the search
    searchTimeoutRef.current[rowIndex] = setTimeout(async () => {
      try {
        const response = await medicationService.searchMedications(query);
        
        // Handle the new API response structure
        if (response && response.success && response.data) {
          const medications = Array.isArray(response.data) ? response.data : (response.data as unknown as { medications?: MedicationSearchResult[] }).medications || [];
          setSearchResults(prev => ({ ...prev, [rowIndex]: medications }));
        } else {
          setSearchResults(prev => ({ ...prev, [rowIndex]: [] }));
        }
      } catch (error) {
        console.error('Error searching medications:', error);
        toast.error('Failed to search medications');
        setSearchResults(prev => ({ ...prev, [rowIndex]: [] }));
      } finally {
        setIsSearching(prev => ({ ...prev, [rowIndex]: false }));
      }
    }, 300); // 300ms debounce
  }, []);

  const selectMedication = useCallback((rowIndex: number, medicationResult: MedicationSearchResult) => {
    setMedications(prev => {
      const newMedications = [...prev];
      const updatedMedication = { ...newMedications[rowIndex] };
      
      updatedMedication.medicine_name = medicationResult.name;
      updatedMedication.composition = medicationResult.composition;
      updatedMedication.dosage_form = medicationResult.dosage_form;
      
      // Keep the default timing (with_food) instead of using medication-specific timing
      // This ensures consistent timing options across all medications
      
      newMedications[rowIndex] = updatedMedication;
      return newMedications;
    });

    // Clear search results for this row and close dropdown
    setSearchResults(prev => ({ ...prev, [rowIndex]: [] }));
    setActiveSearchRow(null);
    
    // Clear dropdown position
    setDropdownPosition(prev => {
      const newPositions = { ...prev };
      delete newPositions[rowIndex];
      return newPositions;
    });

    // Focus back to the input field after a short delay
    setTimeout(() => {
      const inputElement = inputRefs.current[rowIndex];
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  }, []);

  const handleSave = async () => {
    // Send all medications (both new and updated existing ones)
    // Filter out empty medications (no medicine name)
    const validMedications = medications.filter(med => 
      med.medicine_name && med.medicine_name.trim()
    );

    // Separate new vs existing medications for logging
    const newMedications = validMedications.filter(m => !(m.id && m.id > 0));
    const existingMedications = validMedications.filter(m => (m.id && m.id > 0));

    console.log('🔍 Save validation:', {
      totalMedications: medications.length,
      validMedications: validMedications.length,
      newMedications: newMedications.length,
      existingMedications: existingMedications.length,
      newMedicationsData: newMedications.map(m => ({
        name: m.medicine_name,
        morning: m.morning_dose,
        afternoon: m.afternoon_dose,
        evening: m.evening_dose
      }))
    });

    setIsSaving(true);
    try {
      await onSave(validMedications);
      if (newMedications.length > 0) {
        toast.success(`Successfully added ${newMedications.length} new medication(s) and updated ${existingMedications.length} existing medication(s)`);
      } else if (existingMedications.length > 0) {
        toast.success(`Successfully updated ${existingMedications.length} medication(s)`);
      } else {
        toast.success('Medication changes saved successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving medications:', error);
      toast.error('Failed to save medications');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, fieldIndex: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextField = fieldIndex + 1;
      if (nextField >= 5) { // 5 columns (removed quantity column)
        addNewRow();
      }
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      if (expandedInstructionsRow !== null) {
        setExpandedInstructionsRow(null);
      } else {
        onClose();
      }
    }
  };

  const getDosageFrequency = (morning: number, afternoon: number, evening: number) => {
    // Count how many times per day (non-zero doses), not total pills
    const timesPerDay = (morning > 0 ? 1 : 0) + (afternoon > 0 ? 1 : 0) + (evening > 0 ? 1 : 0);
    if (timesPerDay === 0) return 'once_daily';
    if (timesPerDay === 1) return 'once_daily';
    if (timesPerDay === 2) return 'twice_daily';
    if (timesPerDay === 3) return 'thrice_daily';
    return 'custom';
  };

  const getTimingOptions = (medication: Medication) => {
    // Simplified timing options - just After Food and Before Food
    return [
      { value: 'with_food', label: 'After Food' },
      { value: 'before_breakfast', label: 'Before Food' },
      { value: 'empty_stomach', label: 'Empty Stomach' },
      { value: 'bedtime', label: 'Bedtime' }
    ];
  };

  const handleAddNewMedication = useCallback(async (rowIndex: number) => {
    setMedications(prev => {
      const medicationName = prev[rowIndex]?.medicine_name;
      if (!medicationName?.trim()) return prev;
      return prev;
    });

    const medicationName = medications[rowIndex]?.medicine_name;
    if (!medicationName?.trim()) return;

    setIsCreatingMedication(prev => ({ ...prev, [rowIndex]: true }));

    try {
      const response = await medicationService.autoCreateMedication({
        name: medicationName,
        dosage_form: 'tablet'
      });

      if (response && response.success) {
        toast.success('Medication added successfully to database!');
        
        // Get the newly created medication from response
        const newMedication = response.data.medications[0];
        if (newMedication) {
          setMedications(prev => {
            const newMedications = [...prev];
            const updatedMedication = { ...newMedications[rowIndex] };
            
            updatedMedication.medicine_name = newMedication.name;
            updatedMedication.composition = newMedication.composition;
            updatedMedication.dosage_form = newMedication.dosage_form;
            
            // Keep the default timing (with_food) instead of using medication-specific timing
            // This ensures consistent timing options across all medications
            
            newMedications[rowIndex] = updatedMedication;
            return newMedications;
          });
        }
        
        // Clear search results for this row and close dropdown
        setSearchResults(prev => ({ ...prev, [rowIndex]: [] }));
        setActiveSearchRow(null);
        
        // Clear dropdown position
        setDropdownPosition(prev => {
          const newPositions = { ...prev };
          delete newPositions[rowIndex];
          return newPositions;
        });
      } else {
        toast.error('Failed to add medication to database');
      }
    } catch (error) {
      console.error('Error creating medication:', error);
      toast.error('Failed to add medication to database');
    } finally {
      setIsCreatingMedication(prev => ({ ...prev, [rowIndex]: false }));
    }
  }, [medications]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only close if explicitly set to false, not when dropdown interactions occur
      if (!open) {
        onClose();
      }
    }} modal={true}>
      <DialogContent 
        className="max-w-[95vw] flex flex-col overflow-visible"
        onInteractOutside={(e) => {
          // Prevent closing when clicking on portal dropdown
          if ((e.target as Element).closest('.search-dropdown-portal')) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing on Escape if dropdown is open
          if (activeSearchRow !== null) {
            e.preventDefault();
            setActiveSearchRow(null);
            setDropdownPosition({});
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Pill className="w-5 h-5 text-purple-600" />
            Add Medications ({medications.slice(initialMedicationCountRef.current).filter(med => med.medicine_name.trim()).length} new, {initialMedicationCountRef.current} existing)
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Add multiple medications quickly. Use Tab to navigate between fields, Enter to add new row, Ctrl+Enter to save all. Click the instructions icon to add special notes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-visible">
          <div className="relative overflow-visible">
            <Table className="text-sm relative">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b-2">
                  <TableHead className="w-[25%] text-sm font-semibold text-slate-700 uppercase tracking-wide py-3">
                    Medicine Name
                  </TableHead>
                  <TableHead className="w-[15%] text-sm font-semibold text-slate-700 uppercase tracking-wide text-center py-3">
                    Dosage (M-A-E)
                  </TableHead>
                  <TableHead className="w-[15%] text-sm font-semibold text-slate-700 uppercase tracking-wide py-3">
                    Timing
                  </TableHead>
                  <TableHead className="w-[18%] text-sm font-semibold text-slate-700 uppercase tracking-wide py-3">
                    Duration
                  </TableHead>
                  <TableHead className="w-[12%] text-sm font-semibold text-slate-700 uppercase tracking-wide py-3 text-center">
                    Instructions
                  </TableHead>
                  <TableHead className="w-[5%] text-sm font-semibold text-slate-700 uppercase tracking-wide text-center py-3">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="relative overflow-visible">
                {medications.map((medication, index) => (
                  <React.Fragment key={index}>
                    <TableRow className="hover:bg-slate-50">
                    {/* Medicine Name with Autocomplete */}
                    <TableCell className="p-2 relative overflow-visible">
                      <div className="relative overflow-visible">
                        <Input
                          ref={(el) => {
                            if (el) inputRefs.current[index] = el;
                          }}
                          data-row-index={index}
                          value={medication.medicine_name}
                          onChange={(e) => {
                            updateMedication(index, 'medicine_name', e.target.value);
                            handleMedicationSearch(e.target.value, index);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, 0)}
                          placeholder="Search medication..."
                          className="h-10 text-sm border-slate-200 focus:border-purple-500"
                          autoFocus={index === medications.length - 1 && !medication.medicine_name}
                        />
                        {isSearching[index] && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        
                      </div>
                    </TableCell>

                    {/* Dosage (M-A-E) - Dropdown */}
                    <TableCell className="p-2">
                      <Select
                        value={getDosagePattern(medication.morning_dose || 0, medication.afternoon_dose || 0, medication.evening_dose || 0)}
                        onValueChange={(value) => {
                          const { morning_dose, afternoon_dose, evening_dose } = parseDosagePattern(value);
                          updateMedication(index, 'morning_dose', morning_dose);
                          updateMedication(index, 'afternoon_dose', afternoon_dose);
                          updateMedication(index, 'evening_dose', evening_dose);
                          // Auto-update frequency based on dosage pattern
                          const frequency = getDosageFrequency(morning_dose, afternoon_dose, evening_dose);
                          updateMedication(index, 'frequency', frequency);
                        }}
                      >
                        <SelectTrigger className="h-10 text-sm border-slate-200 focus:border-purple-500">
                          <SelectValue placeholder="Select dosage pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOSAGE_PATTERNS.map((pattern) => (
                            <SelectItem key={pattern.value} value={pattern.value}>
                              {pattern.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Timing */}
                    <TableCell className="p-2">
                      <Select
                        value={medication.timing}
                        onValueChange={(value) => {
                          const selectedOption = getTimingOptions(medication).find(opt => opt.value === value);
                          
                          // Update both timing value and display text
                          updateMedication(index, 'timing', value);
                          updateMedication(index, 'timing_display_text', selectedOption?.label || value);
                        }}
                      >
                        <SelectTrigger className="h-10 text-sm border-slate-200 focus:border-purple-500">
                          <SelectValue placeholder="Select timing">
                            {medication.timing_display_text || (getTimingOptions(medication).find(opt => opt.value === medication.timing)?.label) || medication.timing}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {getTimingOptions(medication).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* Debug: Show current timing value */}
                    </TableCell>

                    {/* Duration */}
                    <TableCell className="p-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={medication.duration_days || ''}
                          onChange={(e) => updateMedication(index, 'duration_days', parseInt(e.target.value) || 7)}
                          onKeyDown={(e) => handleKeyDown(e, index, 4)}
                          className="w-20 h-10 text-sm border-slate-200 focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-sm text-slate-500">days</span>
                      </div>
                    </TableCell>


                    {/* Special Instructions - Compact */}
                    <TableCell className="p-2 text-center">
                      <div className="flex items-center justify-center">
                        {medication.special_instructions ? (
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedInstructionsRow(expandedInstructionsRow === index ? null : index)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            {/* Tooltip showing first 30 chars */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                              {medication.special_instructions.length > 30 
                                ? `${medication.special_instructions.substring(0, 30)}...` 
                                : medication.special_instructions}
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedInstructionsRow(expandedInstructionsRow === index ? null : index)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="p-2 text-center">
                      {medications.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Instructions Row */}
                  {expandedInstructionsRow === index && (
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={6} className="p-3">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <Input
                            value={medication.special_instructions || ''}
                            onChange={(e) => updateMedication(index, 'special_instructions', e.target.value)}
                            placeholder="Enter special instructions for this medication..."
                            className="flex-1 h-10 text-sm border-slate-200 focus:border-purple-500"
                            autoFocus
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedInstructionsRow(null)}
                            className="h-10 px-3"
                          >
                            Done
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={addNewRow}
            className="text-sm h-10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-sm h-10"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || medications.every(med => !med.medicine_name.trim())}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm h-10"
          >
            {(() => {
              if (isSaving) return 'Saving...';
              // Count existing medications by presence of a persisted id
              const existingCount = medications.filter(m => (m.id && m.id > 0)).length;
              // Count only valid new rows (with name and any non-zero dose)
              const newCount = medications
                .slice(existingCount)
                .filter(med => (med.medicine_name && med.medicine_name.trim()) && ((med.morning_dose || 0) > 0 || (med.afternoon_dose || 0) > 0 || (med.evening_dose || 0) > 0))
                .length;
              const total = existingCount + newCount;
              return `Save Medications (${total})`;
            })()}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Portal-based Search Dropdown */}
      {activeSearchRow !== null && dropdownPosition[activeSearchRow] && (
        createPortal(
          <div
            className="fixed z-[99999] bg-white border border-slate-200 rounded-md shadow-xl pointer-events-auto search-dropdown-portal"
            style={{
              top: dropdownPosition[activeSearchRow].top,
              left: dropdownPosition[activeSearchRow].left,
              width: dropdownPosition[activeSearchRow].width,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {searchResults[activeSearchRow] && searchResults[activeSearchRow].length > 0 ? (
              <>
                <div className="p-2 bg-slate-50 border-b">
                  <p className="text-xs text-slate-600 font-medium">Found {searchResults[activeSearchRow].length} medication(s)</p>
                </div>
                {searchResults[activeSearchRow].slice(0, 5).map((result, resultIndex) => (
                  <button
                    key={resultIndex}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      selectMedication(activeSearchRow, result);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="w-full text-left p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{result.name}</div>
                        {result.brand_name && result.brand_name !== result.name && (
                          <div className="text-xs text-slate-600">
                            Brand: {result.brand_name}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          {result.strength && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {result.strength}
                            </span>
                          )}
                          {result.dosage_form && (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                              {result.dosage_form}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 text-xs text-slate-400">
                        Select
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : medications[activeSearchRow]?.medicine_name.length >= 2 ? (
              <div className="p-3">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-slate-100 rounded-full flex items-center justify-center">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-600 mb-1">No medications found for</p>
                  <p className="text-sm font-medium text-slate-800 mb-2">"{medications[activeSearchRow]?.medicine_name}"</p>
                  <Button 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddNewMedication(activeSearchRow);
                    }}
                    variant="outline" 
                    size="sm"
                    disabled={isCreatingMedication[activeSearchRow]}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 text-xs"
                  >
                    {isCreatingMedication[activeSearchRow] ? (
                      <>
                        <div className="w-3 h-3 mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Database
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>,
          document.body
        )
      )}
    </Dialog>
  );
});

EnhancedMedicationTable.displayName = 'EnhancedMedicationTable';

export default EnhancedMedicationTable;
