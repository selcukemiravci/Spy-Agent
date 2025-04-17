import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Volume2, Volume1, VolumeX } from 'lucide-react';
import useSound from 'use-sound';
import type { Event } from '../../types';

interface SpyConsoleProps {
  events: Event[];
  title: string;
}

type LogFilter = 'all' | 'critical' | 'warning' | 'normal' | 'auto' | 'manual';

export const SpyConsole: React.FC<SpyConsoleProps> = ({ events, title }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<LogFilter>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Sound effects
  const [playKeyPress] = useSound('/sounds/keypress.mp3', { volume });
  const [playAlert] = useSound('/sounds/alert.mp3', { volume });

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      consoleRef.current?.querySelector('input')?.focus();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const getSeverityLevel = (event: Event): LogFilter => {
    const criticalKeywords = ['breach', 'unauthorized', 'critical'];
    const warningKeywords = ['suspicious', 'anomaly', 'unusual'];
    
    if (criticalKeywords.some(keyword => event.description.toLowerCase().includes(keyword))) {
      return 'critical';
    }
    if (warningKeywords.some(keyword => event.description.toLowerCase().includes(keyword))) {
      return 'warning';
    }
    return 'normal';
  };

  const getEventColor = (severity: LogFilter, type: 'auto' | 'manual') => {
    if (type === 'manual') return 'text-blue-400';
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const filteredEvents = events
    .filter(event => {
      if (filter === 'auto' || filter === 'manual') {
        return event.type === filter;
      }
      if (filter !== 'all') {
        return getSeverityLevel(event) === filter;
      }
      return true;
    })
    .filter(event => 
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(event.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const getLogPrefix = (severity: LogFilter, type: 'auto' | 'manual') => {
    if (type === 'manual') return '🔷 [USER]';
    switch (severity) {
      case 'critical':
        return '🔴 [CRITICAL]';
      case 'warning':
        return '🟡 [WARNING]';
      default:
        return '🟢 [INFO]';
    }
  };

  return (
    <div className="h-full relative bg-gray-900 rounded-lg overflow-hidden" ref={consoleRef}>
      {/* CRT Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-10" />
      </div>

      {/* Console Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-green-400 font-mono">[{title}]</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {soundEnabled ? (
              volume > 0.5 ? (
                <Volume2 className="w-4 h-4 text-gray-400" />
              ) : (
                <Volume1 className="w-4 h-4 text-gray-400" />
              )
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {soundEnabled && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2 p-3 bg-gray-800/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs (Ctrl + F)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (soundEnabled) playKeyPress();
            }}
            className="w-full bg-gray-900 border border-gray-700 rounded pl-9 pr-3 py-1.5 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogFilter)}
            className="bg-gray-900 border border-gray-700 rounded pl-9 pr-3 py-1.5 text-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Logs</option>
            <option value="auto">System Logs</option>
            <option value="manual">User Logs</option>
            <option value="critical">Critical</option>
            <option value="warning">Warnings</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Console Output */}
      <div 
        className="p-3 font-mono text-sm space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
        style={{ height: 'calc(100% - 8.5rem)' }}
      >
        {filteredEvents.map((event) => {
          const severity = getSeverityLevel(event);
          return (
            <div
              key={event.id}
              className={`${getEventColor(severity, event.type)} opacity-90 hover:opacity-100 transition-opacity`}
            >
              <span className="text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
              {' '}
              <span className="font-bold">{getLogPrefix(severity, event.type)}</span>
              {' '}
              {event.description}
            </div>
          );
        })}
        {filteredEvents.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            No logs found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};