import React from 'react';
import CustomizableDashboard from './CustomizableDashboard';
import type { Lookbook } from '../../types';
import type { View } from '../MainApp';

interface DashboardProps {
  onQuickAction: (view: View) => void;
  savedLookbooks: Lookbook[];
}

const Dashboard: React.FC<DashboardProps> = ({ onQuickAction, savedLookbooks }) => {
  return (
    <CustomizableDashboard 
      onQuickAction={onQuickAction} 
      savedLookbooks={savedLookbooks} 
    />
  );
};

export default Dashboard;
