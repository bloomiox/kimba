import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';

const PlanUsage: React.FC = () => {
  const { imageCount } = useSettings();

  return (
    <Card title="Plan & Usage">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium">Current Plan</span>
          <span className="font-bold bg-accent/20 text-accent px-3 py-1 rounded-full text-sm">
            Professional
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Generations Used</span>
          <span className="font-bold">{imageCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Generations</span>
          <span className="font-bold">250</span>
        </div>
      </div>
    </Card>
  );
};

export default PlanUsage;
