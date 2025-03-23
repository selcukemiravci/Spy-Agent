import React from 'react';
import { Play, Pause, Volume2, Battery, Circle } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  volume: number;
  disabled?: boolean;
  onPlayToggle: () => void;
  onVolumeChange: (value: number) => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  volume,
  disabled = false,
  onPlayToggle,
  onVolumeChange,
}) => {
  return (
    <>
      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <button className="p-1.5 bg-black bg-opacity-50 rounded-full">
          <Circle className="h-5 w-5 text-red-500" fill="currentColor" />
        </button>
        <div className="p-1.5 bg-black bg-opacity-50 rounded-full">
          <Battery className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
        <div className="flex items-center space-x-4">
          {!disabled && (
            <button onClick={onPlayToggle}>
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white" />
              )}
            </button>
          )}
          <div className="flex-1 h-1 bg-gray-600 rounded">
            <div className="h-full w-1/3 bg-blue-500 rounded" />
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-white" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onVolumeChange(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </>
  );
};