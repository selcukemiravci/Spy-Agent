import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SystemAlertProps {
  message: string;
  onClose: () => void;
}

export const SystemAlert: React.FC<SystemAlertProps> = ({ message, onClose }) => {
  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 p-4">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-blue-500" />
        <p className="ml-3 text-blue-700">{message}</p>
        <button className="ml-auto" onClick={onClose}>
          <X className="h-5 w-5 text-blue-500" />
        </button>
      </div>
    </div>
  );
};