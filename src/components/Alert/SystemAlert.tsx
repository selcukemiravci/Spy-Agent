// src/components/Alert/SystemAlert.tsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SystemAlertProps {
  message: string;
  onClose: () => void;
}

export const SystemAlert: React.FC<SystemAlertProps> = ({ message, onClose }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 p-4">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <p className="ml-3 text-red-700 font-semibold">
          {message}
        </p>
        <button className="ml-auto" onClick={onClose}>
          <X className="h-5 w-5 text-red-500 hover:text-red-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};