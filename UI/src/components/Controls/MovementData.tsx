import React from 'react';
import { setSpeed, playSound, triggerDeadAction } from '../../services/api';
import type { MovementData as MovementDataType } from '../../types';

interface MovementDataProps {
  data: MovementDataType;        // if you still track speed/direction/tilt in state
  speed: number;                 // the current speed (0, 10, 50, or 100, etc.)
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const MovementData: React.FC<MovementDataProps> = ({
  data,
  speed,
  onSpeedChange,
  disabled = false,
  children,
}) => {
  // Speed slider options
  const speedOptions = [10, 50, 100];
  const speedDescriptions = ["Low", "Medium", "High"];
  
  // Determine slider index
  const currentIndex = speedOptions.indexOf(speed);
  const sliderValue = currentIndex === -1 ? 0 : currentIndex;

  const handleSpeedChange = async (newSpeed: number) => {
    if (disabled) return;
    try {
      onSpeedChange(newSpeed);
      await setSpeed(newSpeed);
    } catch (error) {
      console.error(
        'Speed change error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  const handleMakeDistraction = async () => {
    if (disabled) return;
    try {
      await playSound('distraction'); // call the backend
    } catch (error) {
      console.error('Make Distraction error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handlePlayDead = async () => {
    if (disabled) return;
    try {
      await triggerDeadAction(); // call the backend
    } catch (error) {
      console.error('Play Dead error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="space-y-6">
      {/* (Optional) H2 Title */}
      <h2 className="text-lg font-semibold mb-4">Movement Controls</h2>

      {/* Speed Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Speed Selector
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="1"
          value={sliderValue}
          onChange={(e) => handleSpeedChange(speedOptions[parseInt(e.target.value)])}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            disabled ? 'bg-gray-200 opacity-50' : 'bg-gray-200'
          }`}
          disabled={disabled}
        />
        <div className="text-sm text-gray-600 mt-1">
          Current Speed: {speed} (
          {speedDescriptions[sliderValue] || speedDescriptions[0]})
        </div>
      </div>

      {/* Buttons: Make Distraction + Play Dead */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Spy Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleMakeDistraction}
            className={`px-3 py-2 rounded-lg transition-colors ${
              disabled 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            disabled={disabled}
          >
            Make Distraction
          </button>
          <button
            onClick={handlePlayDead}
            className={`px-3 py-2 rounded-lg transition-colors ${
              disabled 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            disabled={disabled}
          >
            Play Dead
          </button>
        </div>
      </div>

      {/* Optionally render MovementControls or other children */}
      <div className="border-t pt-6">{children}</div>
    </div>
  );
};