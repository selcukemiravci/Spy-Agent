import React from 'react';
import { setSpeed, playSound, triggerDeadAction } from '../../services/api';
import type { MovementData as MovementDataType } from '../../types';

interface MovementDataProps {
  data: MovementDataType;
  speed: number;
  showLogs: boolean;
  showMovementData: boolean;
  onSpeedChange: (speed: number) => void;
  onLogsToggle: () => void;
  onMovementDataToggle: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const MovementData: React.FC<MovementDataProps> = ({
  data,
  speed,
  showLogs,
  showMovementData,
  onSpeedChange,
  onLogsToggle,
  onMovementDataToggle,
  disabled = false,
  children,
}) => {
  // Define the three speed options and their labels.
  const speedOptions = [10, 50, 100];
  const speedDescriptions = ["Low", "Medium", "High"];

  // Determine the slider's index based on the current speed.
  const currentSpeedIndex = speedOptions.indexOf(speed);
  const sliderValue = currentSpeedIndex === -1 ? 0 : currentSpeedIndex;

  const handleSpeedChange = async (newSpeed: number) => {
    if (disabled) return;
    try {
      onSpeedChange(newSpeed);
      await setSpeed(newSpeed);
    } catch (error) {
      console.error('Speed change error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleMakeDistraction = async () => {
    if (disabled) return;
    try {
      // Calls the playSound endpoint with "distraction" type.
      await playSound('distraction');
    } catch (error) {
      console.error('Make Distraction error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handlePlayDead = async () => {
    if (disabled) return;
    try {
      // Calls the triggerDeadAction endpoint.
      await triggerDeadAction();
    } catch (error) {
      console.error('Play Dead error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Movement Data</h2>
        <div className="space-y-4">
          {showMovementData ? (
            <div>
              <p>Speed: {data.speed} cm/s</p>
              <p>Direction: {data.direction}</p>
              <p>Tilt: {data.tilt}°</p>
            </div>
          ) : (
            <div className="text-gray-500">
              <p>Speed: N/A</p>
              <p>Direction: N/A</p>
              <p>Tilt: N/A</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Speed Selector</label>
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={sliderValue}
              onChange={(e) =>
                handleSpeedChange(speedOptions[parseInt(e.target.value)])
              }
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                disabled ? 'bg-gray-200 opacity-50' : 'bg-gray-200'
              }`}
              disabled={disabled}
            />
            <div className="text-sm text-gray-600 mt-1">
              Current Speed: {speed} ({speedDescriptions[sliderValue]})
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Logs</span>
            <button
              onClick={onLogsToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                showLogs ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  showLogs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>Movement Data</span>
            <button
              onClick={onMovementDataToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                showMovementData ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  showMovementData ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        {children}
      </div>

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
    </div>
  );
};