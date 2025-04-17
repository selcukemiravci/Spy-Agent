import React, { useState, useEffect, useCallback } from 'react';
import { Eye, History, Menu, X } from 'lucide-react';
import { VideoFeed } from './components/VideoFeed/VideoFeed';
import { MovementControls } from './components/Controls/MovementControls';
import { MovementData } from './components/Controls/MovementData';
import { Timeline } from './components/Timeline/Timeline';
import { EventModal } from './components/Events/EventModal';
import { SpyConsole } from './components/SpyConsole/SpyConsole';
import { TargetUpload } from './components/TargetUpload/TargetUpload';
import logo from './assets/logo.svg';

// Types and services
import type { Event, MovementData as MovementDataType, Mode } from './types';
import { addEvent, getLogs } from './services/api';

function App() {
  // LIVE or REVIEW mode
  const [mode, setMode] = useState<Mode>('live');

  // Speed slider
  const [speed, setSpeed] = useState(10);

  // Mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Playback / timeline for review
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Logs
  const [events, setEvents] = useState<Event[]>([]);

  // Modal for manual "Mark Event" annotation
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<{ start: number; end: number } | null>(null);

  // Movement data object (used by MovementData)
  const [movementData, setMovementData] = useState<MovementDataType>({
    speed: 0,
    direction: 'Heading 45° NE',
    tilt: 3,
  });

  // ======================================
  // 1) FETCH LOGS FROM SERVER ON MOUNT + POLL
  // ======================================
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getLogs();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    fetchLogs();

    // Re-fetch every 5s
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  // ======================================
  // 2) Handlers
  // ======================================

  /**
   * Called when user clicks "Mark Event" button in LIVE mode.
   * Simply opens the annotation modal. No empty logs created here.
   */
  const handleQuickMark = () => {
    setShowAnnotationModal(true);
    setIsMobileMenuOpen(false);
  };

  /**
   * Called when user clicks "Save" in the EventModal.
   * If annotation is non-empty, we create a new log on the server and locally.
   */
  const handleAddEvent = async () => {
    const trimmed = newAnnotation.trim();
    if (!trimmed) return; // Don't do anything if annotation is empty

    try {
      // Add on the server
      await addEvent(trimmed);

      // Create local object so console updates immediately
      const newLog: Event = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        description: trimmed,
        type: 'manual', // or 'info' if you prefer
      };
      setEvents((prev) => [...prev, newLog]);

      // Reset
      setNewAnnotation('');
      setShowAnnotationModal(false);
      setSelectedTimeframe(null);
    } catch (error) {
      console.error('Failed to add manual annotation event:', error);
    }
  };

  /**
   * Called when user drags on the timeline in REVIEW mode,
   * providing a start/end timeframe. We open the annotation modal
   * so user can label that timeframe.
   */
  const handleMarkTimeframe = useCallback((start: number, end: number) => {
    setSelectedTimeframe({ start, end });
    setShowAnnotationModal(true);
  }, []);

  /**
   * Called if user uploads a target image in the UI
   */
  const handleTargetUpload = (file: File) => {
    console.log('Target image uploaded:', file.name);
  };

  /**
   * Toggles between LIVE mode and REVIEW mode
   */
  const toggleMode = () => {
    setMode((prev) => (prev === 'live' ? 'review' : 'live'));
    setIsMobileMenuOpen(false);

    // If we just switched to "review," reset playback
    if (mode === 'review') {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // ======================================
  // 3) Render
  // ======================================
  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50 flex-none">
        <div className="max-w-[2000px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Robot Spy Logo"
                className="h-8 w-8 md:h-12 md:w-12"
              />
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900 hidden sm:block">
                Robot Spy Interface
              </h1>
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

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto bg-gray-100">
        <div className="h-full max-w-[2000px] mx-auto px-4 py-6">
          <div className="h-full space-y-4">
            {mode === 'live' ? (
              // LIVE MODE
              <div className="grid h-[calc(100vh-14rem)] grid-cols-1 md:grid-cols-12 gap-4">
                {/* LEFT: Video + Logs */}
                <div className="md:col-span-8 flex flex-col gap-4">
                  <div className="flex-1">
                    <VideoFeed mode={mode} events={events} />
                  </div>
                  <div className="h-[400px] bg-white rounded-lg shadow overflow-hidden">
                    <SpyConsole events={events} title="Mission Logs" />
                  </div>
                </div>

                {/* RIGHT: Movement & TargetUpload */}
                <div
                  className={`md:col-span-4 flex flex-col gap-6 ${
                    isMobileMenuOpen ? 'block' : 'hidden md:block'
                  }`}
                >
                  <div className="bg-white rounded-lg shadow p-4">
                    <MovementData
                      data={movementData}
                      speed={speed}
                      onSpeedChange={(val) => setSpeed(val)}
                      disabled={mode !== 'live'}
                    >
                      <MovementControls disabled={mode !== 'live'} />
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
            ) : (
              // REVIEW MODE
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
            )}
          </div>
        </div>
      </main>

      {/* EventModal for annotation */}
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