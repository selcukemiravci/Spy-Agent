import React from 'react';
import { AlertTriangle, Flag } from 'lucide-react';
import type { Event } from '../../types';

interface EventListProps {
  events: Event[];
  type: 'auto' | 'manual';
  title: string;
}

export const EventList: React.FC<EventListProps> = ({ events, type, title }) => {
  // Take only the latest 2 events for initial display
  const filteredEvents = events
    .filter((event) => event.type === type)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 2);

  return (
    <div className="h-full">
      <h3 className="font-semibold mb-4 sticky top-0 bg-white z-10 pb-2 border-b">{title}</h3>
      <div 
        className="space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{
          maxHeight: 'calc(100% - 3rem)',
          scrollbarWidth: 'thin',
          msOverflowStyle: 'none'
        }}
      >
        {filteredEvents.map((event) => (
          <div key={event.id} className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <div className="flex items-start space-x-2">
              {type === 'auto' ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
              ) : (
                <Flag className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 break-words">{event.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {events.filter(event => event.type === type).length > 2 && (
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2">
            View all ({events.filter(event => event.type === type).length})
          </button>
        )}
      </div>
    </div>
  );
};