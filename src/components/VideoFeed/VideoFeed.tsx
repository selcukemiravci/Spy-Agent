import React, { useState, useEffect } from 'react';
import { socket } from '../../services/api';
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
    socket.on('stealth-update', (level: number) => {
      setStealthLevel(level);
    });

    return () => {
      socket.off('stealth-update');
    };
  }, []);

  useEffect(() => {
    if (mode === 'live') {
      setIsPlaying(true);
    }
  }, [mode]);

  return (
    <div className="relative aspect-[16/10] bg-black rounded-lg">
      <div className="absolute top-2 left-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
        {mode === 'live' ? 'LIVE' : 'REVIEW'}
      </div>
      <StealthMeter level={stealthLevel} />
      <VideoControls
        isPlaying={isPlaying}
        volume={volume}
        onPlayToggle={() => setIsPlaying(!isPlaying)}
        onVolumeChange={setVolume}
        disabled={mode === 'live'}
      />
    </div>
  );
};