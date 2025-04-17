import React, { useState } from 'react';
import { ChevronFirst, Play, ChevronLast, Clock } from 'lucide-react';
import type { Event } from '../../types';

interface TimelineProps {
  events: Event[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onTimeChange: (time: number) => void;
  onMarkTimeframe: (start: number, end: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  currentTime,
  duration,
  isPlaying,
  onPlayToggle,
  onTimeChange,
  onMarkTimeframe,
}) => {
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEventMarkers = () => {
    return events.map((event) => {
      const timestamp = new Date(event.timestamp).getTime();
      const position = ((timestamp % (duration * 1000)) / (duration * 1000)) * 100;
      const isAuto = event.type === 'auto';
      
      return (
        <div
          key={event.id}
          className={`absolute h-full w-1 ${isAuto ? 'bg-blue-500' : 'bg-red-500'} cursor-pointer`}
          style={{ left: `${position}%` }}
          title={`${event.description} - ${new Date(event.timestamp).toLocaleTimeString()}`}
        />
      );
    });
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    onTimeChange(position * duration);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    setSelectionStart(position * duration);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && selectionStart !== null) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      setSelectionEnd(position * duration);
    }
  };

  const handleMouseUp = () => {
    if (selectionStart !== null && selectionEnd !== null) {
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);
      onMarkTimeframe(start, end);
    }
    setIsDragging(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <ChevronFirst className="h-5 w-5 cursor-pointer hover:text-blue-600" />
          <button onClick={onPlayToggle}>
            <Play className={`h-5 w-5 ${isPlaying ? 'text-blue-600' : ''}`} />
          </button>
          <ChevronLast className="h-5 w-5 cursor-pointer hover:text-blue-600" />
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>

      <div
        className="relative h-8 bg-gray-100 rounded cursor-pointer"
        onClick={handleTimelineClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const rect = e.currentTarget.getBoundingClientRect();
          const position = (touch.clientX - rect.left) / rect.width;
          setSelectionStart(position * duration);
          setIsDragging(true);
        }}
        onTouchMove={(e) => {
          if (isDragging && selectionStart !== null) {
            const touch = e.touches[0];
            const rect = e.currentTarget.getBoundingClientRect();
            const position = (touch.clientX - rect.left) / rect.width;
            setSelectionEnd(position * duration);
          }
        }}
        onTouchEnd={handleMouseUp}
      >
        {getEventMarkers()}

        <div
          className="absolute top-0 h-full w-0.5 bg-blue-600"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />

        {isDragging && selectionStart !== null && selectionEnd !== null && (
          <div
            className="absolute top-0 h-full bg-blue-200 opacity-50"
            style={{
              left: `${Math.min(selectionStart, selectionEnd) / duration * 100}%`,
              width: `${Math.abs(selectionEnd - selectionStart) / duration * 100}%`
            }}
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 space-y-2 sm:space-y-0">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Auto-flagged</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>User-marked</span>
          </div>
        </div>
        <div>
          <span className="hidden sm:inline">Click and drag to mark timeframe</span>
          <span className="sm:hidden">Tap and hold to mark timeframe</span>
        </div>
      </div>
    </div>
  );
};