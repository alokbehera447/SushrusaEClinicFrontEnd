import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Pill, Database, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';
import { medicationService } from '../services/medicationService';

interface MedicationSearchProps {
  onMedicationSelect: (medication: Medication) => void;
  placeholder?: string;
  className?: string;
  includeFDA?: boolean;
}

interface Medication {
  id: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  strength: string;
  dosage_form: string;
  source: 'local_database' | 'fda_api' | 'inventory' | 'previously_prescribed' | 'existing_inventory' | 'newly_created';
  therapeutic_class?: string;
  is_verified: boolean;
  medication_type?: string;
  composition?: string;
  indication?: string;
  manufacturer?: string;
}

const MedicationSearch: React.FC<MedicationSearchProps> = ({
  onMedicationSelect,
  placeholder = "Search medications...",
  className = "",
  includeFDA = true // Enable FDA by default
}) => {
  const [query, setQuery] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search medications with debouncing
  useEffect(() => {
    const searchMedications = async () => {
      if (query.length < 2) {
        setMedications([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await medicationService.searchMedications(query, 20, includeFDA);
        
        if (data.success) {
          setMedications(data.data.medications);
          setShowDropdown(true);
        } else {
          setError('Search failed');
        }
      } catch (err) {
        setError('Failed to search medications');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMedications, 300);
    return () => clearTimeout(timeoutId);
  }, [query, includeFDA]);

  const handleMedicationSelect = (medication: Medication) => {
    onMedicationSelect(medication);
    setQuery(medication.name);
    setShowDropdown(false);
  };

  const getSourceIcon = (source: string) => {
    return source === 'fda_api' ? (
      <ExternalLink className="w-4 h-4 text-blue-500" />
    ) : (
      <Database className="w-4 h-4 text-green-500" />
    );
  };

  const getVerificationIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-500" />
    );
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* FDA Integration Status */}
      {includeFDA && (
        <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          FDA Database Enabled - Access to 50,000+ medications
        </div>
      )}

      {/* Dropdown Results */}
      {showDropdown && medications.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {medications
            .filter(medication => medication.source !== 'previously_prescribed')
            .map((medication) => (
            <div
              key={medication.id}
              onClick={() => handleMedicationSelect(medication)}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-900">{medication.name}</span>
                    {getVerificationIcon(medication.is_verified)}
                    {getSourceIcon(medication.source)}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    {medication.brand_name && medication.brand_name !== medication.name && (
                      <div className="font-medium text-blue-600">Brand: {medication.brand_name}</div>
                    )}
                    {medication.composition && (
                      <div>Composition: {medication.composition}</div>
                    )}
                    {medication.dosage_form && (
                      <div>Form: {medication.dosage_form}</div>
                    )}
                    {medication.strength && (
                      <div>Strength: {medication.strength}</div>
                    )}
                    {medication.manufacturer && (
                      <div className="text-xs text-gray-500">Manufacturer: {medication.manufacturer}</div>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 ml-2">
                  {medication.source === 'fda_api' ? 'FDA Database' : 'Local Database'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showDropdown && !loading && medications.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-center text-gray-500">
            <Pill className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No medications found for "{query}"</p>
            {includeFDA && (
              <p className="text-sm mt-1">
                Try a different search term or check spelling
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationSearch;
