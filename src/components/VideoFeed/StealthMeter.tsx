import React from 'react';
import { Shield, AlertTriangle, AlertOctagon } from 'lucide-react';

interface StealthMeterProps {
  level: number; // 0-100
}

export const StealthMeter: React.FC<StealthMeterProps> = ({ level }) => {
  const getStealthColor = (level: number) => {
    if (level <= 30) return 'bg-green-500';
    if (level <= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const StealthIcon = () => {
    if (level <= 30) return <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />;
    if (level <= 70) return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-700" />;
    return <AlertOctagon className="h-4 w-4 sm:h-5 sm:w-5 text-red-700" />;
  };

  return (
    <div className="absolute left-2 sm:left-4 top-8 sm:top-12 flex flex-col items-center">
      <span className="text-[10px] sm:text-xs font-medium text-white bg-black bg-opacity-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded mb-1">
        Stealth Meter
      </span>
      <div className="relative h-32 sm:h-48 w-4 sm:w-6 bg-gray-800 rounded overflow-hidden">
        <div
          className={`absolute bottom-0 w-full transition-all duration-300 ${getStealthColor(level)}`}
          style={{ height: `${level}%` }}
        />
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
          <StealthIcon />
        </div>
      </div>
    </div>
  );
};