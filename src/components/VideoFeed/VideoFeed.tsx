import React, { useState, useEffect } from 'react';
import { VideoControls } from './VideoControls';
import { StealthMeter } from './StealthMeter';
import type { Mode, Event } from '../../types';

interface VideoFeedProps {
  mode: Mode;
  events: Event[];
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ mode, events }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [stealthLevel, setStealthLevel] = useState(33);


  useEffect(() => {
    if (mode === 'live') {
      setIsPlaying(true);
    } else {
      // In review mode, we don't need the live stream
    }
  }, [mode]);


  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    
    if (mode === 'live') {
      if (!isPlaying) {
      } else {
      }
    }
  };

  return (
    <div className="relative aspect-[16/10] bg-black rounded-lg overflow-hidden">
      <div className="absolute top-2 left-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm z-10">
        {mode === 'live' ? 'LIVE' : 'REVIEW'}
      </div>

      {mode === 'live' ? (
        // Live camera feed from the spy robot
        <img 
          // src="http://192.168.1.101:9000/mjpg"
          src="http://172.17.10.188:9000/mjpg"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isPlaying ? 'block' : 'none' }}
          alt="Live camera feed"
        />
      ) : (
        // Review mode - would show recorded footage
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-center p-4">
            <p className="text-lg font-medium">Review Mode</p>
            <p className="text-sm mt-2">Recorded footage would play here</p>
          </div>
        </div>
      )}

      <StealthMeter level={stealthLevel} />
      <VideoControls
        isPlaying={isPlaying}
        volume={volume}
        onPlayToggle={handlePlayToggle}
        onVolumeChange={setVolume}
        disabled={mode === 'live'}
      />
    </div>
  );
};