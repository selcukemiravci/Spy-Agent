import React, { useState, useCallback } from 'react';
import { Eye, History, Menu, X } from 'lucide-react';
import { VideoFeed } from './components/VideoFeed/VideoFeed';
import { MovementControls } from './components/Controls/MovementControls';
import { MovementData } from './components/Controls/MovementData';
import { Timeline } from './components/Timeline/Timeline';
import { SystemAlert } from './components/Alert/SystemAlert';
import { EventModal } from './components/Events/EventModal';
import { SpyConsole } from './components/SpyConsole/SpyConsole';
import { TargetUpload } from './components/TargetUpload/TargetUpload';
import type { Event, MovementData as MovementDataType, Mode } from './types';
import { addEvent } from './services/api';
import logo from './assets/logo.svg';

function App() {
  const [mode, setMode] = useState<Mode>('live');
  const [speed, setSpeed] = useState(0);
  const [showLogs, setShowLogs] = useState(true);
  const [showMovementData, setShowMovementData] = useState(true);
  const [showAlert, setShowAlert] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([
    { id: '1', timestamp: '2024-02-26T00:13:36Z', description: 'Suspicious Movement', type: 'manual' },
    { id: '2', timestamp: '2024-02-26T11:20:18Z', description: 'Obstacle detected', type: 'auto' },
    { id: '3', timestamp: '2024-02-26T12:15:00Z', description: 'Unusual heat signature detected', type: 'auto' },
    { id: '4', timestamp: '2024-02-26T12:30:45Z', description: 'Movement pattern analysis: Possible target spotted', type: 'auto' },
    { id: '5', timestamp: '2024-02-26T13:00:22Z', description: 'Security breach attempt detected', type: 'auto' },
    { id: '6', timestamp: '2024-02-26T13:45:10Z', description: 'Marked: Suspicious package handoff', type: 'manual' },
    { id: '7', timestamp: '2024-02-26T14:20:05Z', description: 'Audio anomaly detected', type: 'auto' },
    { id: '8', timestamp: '2024-02-26T15:10:30Z', description: 'Marked: Covert meeting observed', type: 'manual' },
    { id: '9', timestamp: '2024-02-26T16:05:15Z', description: 'Facial recognition match: Target identified', type: 'auto' },
    { id: '10', timestamp: '2024-02-26T16:30:00Z', description: 'Marked: Document exchange', type: 'manual' },
    { id: '11', timestamp: '2024-02-26T17:15:45Z', description: 'Network signal interference detected', type: 'auto' },
    { id: '12', timestamp: '2024-02-26T18:00:20Z', description: 'Marked: Suspicious vehicle activity', type: 'manual' },
    { id: '13', timestamp: '2024-02-26T18:45:10Z', description: 'Environmental anomaly detected', type: 'auto' },
    { id: '14', timestamp: '2024-02-26T19:20:05Z', description: 'Marked: Hidden compartment discovered', type: 'manual' },
    { id: '15', timestamp: '2024-02-26T20:00:30Z', description: 'Unauthorized access attempt', type: 'auto' }
  ]);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<{ start: number; end: number } | null>(null);
  const [movementData, setMovementData] = useState<MovementDataType>({
    speed: 0,
    direction: 'Heading 45° NE',
    tilt: 3,
  });

  const handleQuickMark = () => {
    setShowAnnotationModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleAddEvent = async () => {
    if (newAnnotation.trim()) {
      try {
        await addEvent(newAnnotation);
        const newEvent: Event = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          description: newAnnotation,
          type: 'manual',
        };
        setEvents([...events, newEvent]);
        setNewAnnotation('');
        setShowAnnotationModal(false);
        setSelectedTimeframe(null);
      } catch (error) {
        console.error('Failed to add event:', error);
      }
    }
  };

  const handleMarkTimeframe = useCallback((start: number, end: number) => {
    setSelectedTimeframe({ start, end });
    setShowAnnotationModal(true);
  }, []);

  const handleTargetUpload = (file: File) => {
    console.log('Target image uploaded:', file.name);
    // Here you would typically upload the file to your server
  };

  const toggleMode = () => {
    setMode(prev => prev === 'live' ? 'review' : 'live');
    setIsMobileMenuOpen(false);
    if (mode === 'review') {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-50 flex-none">
        <div className="max-w-[2000px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Robot Spy Logo" className="h-8 w-8 md:h-12 md:w-12" />
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900 hidden sm:block">Robot Spy Interface</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMode}
                className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                {mode === 'live' ? (
                  <>
                    <History className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">Review</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">Go Live</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {showAlert && (
        <SystemAlert
          message="System Alert: Anomaly has been detected with auto-flag, please look into it."
          onClose={() => setShowAlert(false)}
        />
      )}

      <main className="flex-1 overflow-auto bg-gray-100">
        <div className="h-full max-w-[2000px] mx-auto px-4 py-6">
          <div className="h-full space-y-4">
            {mode === 'live' ? (
              <>
                <div className="grid h-[calc(100vh-14rem)] grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 flex flex-col gap-4">
                    <div className="flex-1">
                      <VideoFeed mode={mode} events={events} />
                    </div>
                    <div className="h-[400px] bg-white rounded-lg shadow overflow-hidden">
                      <SpyConsole events={events} title="Mission Logs" />
                    </div>
                  </div>

                  <div className={`md:col-span-4 flex flex-col gap-6 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
                    <div className="bg-white rounded-lg shadow p-4">
                      <MovementData
                        data={movementData}
                        speed={speed}
                        showLogs={showLogs}
                        showMovementData={showMovementData}
                        onSpeedChange={setSpeed}
                        onLogsToggle={() => setShowLogs(!showLogs)}
                        onMovementDataToggle={() => setShowMovementData(!showMovementData)}
                        disabled={mode === 'review'}
                      >
                        <MovementControls disabled={mode === 'review'} />
                      </MovementData>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={handleQuickMark}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Mark Event
                      </button>
                    </div>
                    <div>
                      <TargetUpload onUpload={handleTargetUpload} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid h-[calc(100vh-14rem)] grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <VideoFeed mode={mode} events={events} />
                    <div className="bg-white rounded-lg shadow p-4">
                      <Timeline
                        events={events}
                        currentTime={currentTime}
                        duration={300}
                        isPlaying={isPlaying}
                        onPlayToggle={() => setIsPlaying(!isPlaying)}
                        onTimeChange={setCurrentTime}
                        onMarkTimeframe={handleMarkTimeframe}
                      />
                    </div>
                  </div>
                  
                  <div className="lg:col-span-4 h-full">
                    <div className="h-full bg-white rounded-lg shadow overflow-hidden">
                      <SpyConsole events={events} title="Mission Logs" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <EventModal
        show={showAnnotationModal}
        annotation={newAnnotation}
        onAnnotationChange={setNewAnnotation}
        onSave={handleAddEvent}
        onClose={() => {
          setShowAnnotationModal(false);
          setSelectedTimeframe(null);
        }}
      />
    </div>
  );
}

export default App;