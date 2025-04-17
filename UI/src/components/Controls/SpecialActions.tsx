import React from 'react';
import { Skull, Music, Camera, Shield } from 'lucide-react';
import { triggerDeadAction, playSound, takePhoto, getDistance } from '../../services/api';

interface SpecialActionsProps {
  disabled?: boolean;
}

export const SpecialActions: React.FC<SpecialActionsProps> = ({ disabled = false }) => {
  const [distance, setDistance] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleDeadAction = async () => {
    if (disabled || loading) return;
    try {
      setLoading('dead');
      await triggerDeadAction();
    } catch (error) {
      console.error('Failed to trigger dead action:', error);
    } finally {
      setLoading(null);
    }
  };

  const handlePlaySound = async (type: 'death' | 'distraction') => {
    if (disabled || loading) return;
    try {
      setLoading(`sound-${type}`);
      await playSound(type);
    } catch (error) {
      console.error(`Failed to play ${type} sound:`, error);
    } finally {
      setLoading(null);
    }
  };

  const handleTakePhoto = async () => {
    if (disabled || loading) return;
    try {
      setLoading('photo');
      await takePhoto();
    } catch (error) {
      console.error('Failed to take photo:', error);
    } finally {
      setLoading(null);
    }
  };

  const fetchDistance = async () => {
    if (disabled || loading) return;
    try {
      setLoading('distance');
      const response = await getDistance();
      setDistance(response.data.distance);
      // Auto-clear the distance after 3 seconds
      setTimeout(() => setDistance(null), 3000);
    } catch (error) {
      console.error('Failed to get distance:', error);
    } finally {
      setLoading(null);
    }
  };

  const getButtonStyles = (action: string) => {
    const baseStyles = "flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-150";
    const isLoading = loading === action;
    
    if (disabled) {
      return `${baseStyles} bg-gray-100 cursor-not-allowed`;
    } else if (isLoading) {
      return `${baseStyles} bg-blue-200 shadow-inner`;
    } else {
      return `${baseStyles} bg-blue-100 hover:bg-blue-200 cursor-pointer active:bg-blue-200`;
    }
  };

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h3 className="text-sm font-medium text-gray-900">Special Actions</h3>
        <p className="text-xs text-gray-500 mt-1">Spy robot special capabilities</p>
      </div>
      
      {distance !== null && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-lg text-center">
          <p className="text-sm font-medium text-blue-900">Distance: {distance.toFixed(2)} cm</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDeadAction}
          className={getButtonStyles('dead')}
          disabled={disabled || loading !== null}
          aria-label="Play Dead"
        >
          <Skull className={`h-6 w-6 ${disabled ? 'text-gray-400' : 'text-blue-600'}`} />
          <span className="text-xs text-gray-500 mt-1">Play Dead</span>
        </button>
        
        <button
          onClick={() => handlePlaySound('distraction')}
          className={getButtonStyles('sound-distraction')}
          disabled={disabled || loading !== null}
          aria-label="Play Distraction Sound"
        >
          <Music className={`h-6 w-6 ${disabled ? 'text-gray-400' : 'text-blue-600'}`} />
          <span className="text-xs text-gray-500 mt-1">Distraction</span>
        </button>
        
        <button
          onClick={handleTakePhoto}
          className={getButtonStyles('photo')}
          disabled={disabled || loading !== null}
          aria-label="Take Photo"
        >
          <Camera className={`h-6 w-6 ${disabled ? 'text-gray-400' : 'text-blue-600'}`} />
          <span className="text-xs text-gray-500 mt-1">Take Photo</span>
        </button>
        
        <button
          onClick={fetchDistance}
          className={getButtonStyles('distance')}
          disabled={disabled || loading !== null}
          aria-label="Check Distance"
        >
          <Shield className={`h-6 w-6 ${disabled ? 'text-gray-400' : 'text-blue-600'}`} />
          <span className="text-xs text-gray-500 mt-1">Check Distance</span>
        </button>
      </div>

      {disabled && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Actions disabled in review mode
        </p>
      )}
    </div>
  );
}; 