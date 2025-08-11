import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Scale, 
  Eye,
  Plus,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface VitalSigns {
  pulse: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  temperature: string;
  weight: string;
  height: string;
  oxygenSaturation: string;
}

interface VitalSignsPanelProps {
  vitalSigns: VitalSigns;
  onVitalSignsChange: (vitalSigns: VitalSigns) => void;
}

const VitalSignsPanel: React.FC<VitalSignsPanelProps> = ({ vitalSigns, onVitalSignsChange }) => {
  const handleInputChange = (field: keyof VitalSigns, value: string) => {
    onVitalSignsChange({
      ...vitalSigns,
      [field]: value
    });
  };

  const getVitalSignStatus = (type: string, value: string) => {
    if (!value) return 'normal';
    
    const numValue = parseFloat(value);
    
    switch (type) {
      case 'pulse':
        if (numValue < 60) return 'low';
        if (numValue > 100) return 'high';
        return 'normal';
      case 'bloodPressureSystolic':
        if (numValue < 90) return 'low';
        if (numValue > 140) return 'high';
        return 'normal';
      case 'bloodPressureDiastolic':
        if (numValue < 60) return 'low';
        if (numValue > 90) return 'high';
        return 'normal';
      case 'temperature':
        if (numValue < 36.1) return 'low';
        if (numValue > 37.2) return 'high';
        return 'normal';
      case 'oxygenSaturation':
        if (numValue < 95) return 'low';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'low':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high':
      case 'low':
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  const calculateBMI = () => {
    const weight = parseFloat(vitalSigns.weight);
    const height = parseFloat(vitalSigns.height);
    
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Vital Signs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pulse Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pulse" className="text-sm font-medium flex items-center">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              Pulse Rate (bpm)
            </Label>
            {vitalSigns.pulse && (
              <Badge className={`text-xs ${getStatusColor(getVitalSignStatus('pulse', vitalSigns.pulse))}`}>
                <getStatusIcon(getVitalSignStatus('pulse', vitalSigns.pulse)) className="w-3 h-3 mr-1" />
                {getVitalSignStatus('pulse', vitalSigns.pulse)}
              </Badge>
            )}
          </div>
          <Input
            id="pulse"
            type="number"
            placeholder="e.g., 72"
            value={vitalSigns.pulse}
            onChange={(e) => handleInputChange('pulse', e.target.value)}
            className="h-10"
          />
        </div>

        {/* Blood Pressure */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-500" />
              Blood Pressure (mmHg)
            </Label>
            {(vitalSigns.bloodPressureSystolic || vitalSigns.bloodPressureDiastolic) && (
              <Badge className={`text-xs ${getStatusColor(getVitalSignStatus('bloodPressureSystolic', vitalSigns.bloodPressureSystolic))}`}>
                <getStatusIcon(getVitalSignStatus('bloodPressureSystolic', vitalSigns.bloodPressureSystolic)) className="w-3 h-3 mr-1" />
                BP Status
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="systolic" className="text-xs text-gray-500">Systolic</Label>
              <Input
                id="systolic"
                type="number"
                placeholder="120"
                value={vitalSigns.bloodPressureSystolic}
                onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="diastolic" className="text-xs text-gray-500">Diastolic</Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                value={vitalSigns.bloodPressureDiastolic}
                onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature" className="text-sm font-medium flex items-center">
              <Thermometer className="w-4 h-4 mr-2 text-orange-500" />
              Temperature (°C)
            </Label>
            {vitalSigns.temperature && (
              <Badge className={`text-xs ${getStatusColor(getVitalSignStatus('temperature', vitalSigns.temperature))}`}>
                <getStatusIcon(getVitalSignStatus('temperature', vitalSigns.temperature)) className="w-3 h-3 mr-1" />
                {getVitalSignStatus('temperature', vitalSigns.temperature)}
              </Badge>
            )}
          </div>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="e.g., 36.8"
            value={vitalSigns.temperature}
            onChange={(e) => handleInputChange('temperature', e.target.value)}
            className="h-10"
          />
        </div>

        {/* Weight and Height */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <Scale className="w-4 h-4 mr-2 text-green-500" />
            Weight & Height
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="weight" className="text-xs text-gray-500">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70"
                value={vitalSigns.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs text-gray-500">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={vitalSigns.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          {bmi && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">BMI:</span>
              <Badge variant="outline" className="text-xs">
                {bmi} kg/m²
              </Badge>
            </div>
          )}
        </div>

        {/* Oxygen Saturation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="oxygenSaturation" className="text-sm font-medium flex items-center">
              <Eye className="w-4 h-4 mr-2 text-purple-500" />
              Oxygen Saturation (%)
            </Label>
            {vitalSigns.oxygenSaturation && (
              <Badge className={`text-xs ${getStatusColor(getVitalSignStatus('oxygenSaturation', vitalSigns.oxygenSaturation))}`}>
                <getStatusIcon(getVitalSignStatus('oxygenSaturation', vitalSigns.oxygenSaturation)) className="w-3 h-3 mr-1" />
                {getVitalSignStatus('oxygenSaturation', vitalSigns.oxygenSaturation)}
              </Badge>
            )}
          </div>
          <Input
            id="oxygenSaturation"
            type="number"
            placeholder="e.g., 98"
            value={vitalSigns.oxygenSaturation}
            onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
            className="h-10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <Button size="sm" variant="outline" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Vital Signs Summary */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Vital Signs Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {vitalSigns.pulse && (
              <div className="flex justify-between">
                <span className="text-blue-700">Pulse:</span>
                <span className="font-medium">{vitalSigns.pulse} bpm</span>
              </div>
            )}
            {(vitalSigns.bloodPressureSystolic || vitalSigns.bloodPressureDiastolic) && (
              <div className="flex justify-between">
                <span className="text-blue-700">BP:</span>
                <span className="font-medium">
                  {vitalSigns.bloodPressureSystolic}/{vitalSigns.bloodPressureDiastolic} mmHg
                </span>
              </div>
            )}
            {vitalSigns.temperature && (
              <div className="flex justify-between">
                <span className="text-blue-700">Temp:</span>
                <span className="font-medium">{vitalSigns.temperature}°C</span>
              </div>
            )}
            {vitalSigns.oxygenSaturation && (
              <div className="flex justify-between">
                <span className="text-blue-700">SpO₂:</span>
                <span className="font-medium">{vitalSigns.oxygenSaturation}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VitalSignsPanel;
