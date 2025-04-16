import React, { useState, useEffect } from 'react';
import { VideoControls } from './VideoControls';
import { StealthMeter } from './StealthMeter';
import type { Mode, Event } from '../../types';

// We only need getLatestRecording now.
import { getLatestRecording } from '../../services/api';

interface VideoFeedProps {
  mode: Mode;
  events: Event[];
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ mode, events }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [stealthLevel, setStealthLevel] = useState(33);
  const [shutdown, setShutdown] = useState(false);
  const [latestRecording, setLatestRecording] = useState<string | null>(null);

  // When mode changes, decide whether to show the live feed or not.
  useEffect(() => {
    if (mode === 'live') {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [mode]);

  // If in review mode, fetch the latest MP4 filename from /latest.
  useEffect(() => {
    if (mode === 'review') {
      (async () => {
        try {
          const res = await getLatestRecording();
          if (res.data.latest) {
            setLatestRecording(res.data.latest);
          }
        } catch (err) {
          console.error("Error fetching latest recording:", err);
        }
      })();
    }
  }, [mode]);

  // Called by the play/pause button in VideoControls
  const handlePlayToggle = () => {
    // If the system is flagged as shutdown, ignore user play toggles
    if (shutdown) return;
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="relative aspect-[16/10] bg-black rounded-lg overflow-hidden">
      {/* Shows LIVE or REVIEW in the top-left corner */}
      <div className="absolute top-2 left-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm z-10">
        {mode === 'live' ? 'LIVE' : 'REVIEW'}
      </div>

      {mode === 'live' ? (
        // LIVE mode: show MJPEG stream from your camera
        // Home 
        // <img
        //   src="http://192.168.1.101:9000/mjpg"
        //   className="absolute inset-0 w-full h-full object-cover"
        //   style={{ display: isPlaying ? 'block' : 'none' }}
        //   alt="Live camera feed"
        // />
        // School
        <img
          src="http://172.17.10.188:9000/mjpg"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isPlaying ? 'block' : 'none' }}
          alt="Live camera feed"
        />
      ) : (
        // REVIEW mode: show the latest MP4
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          {latestRecording ? (
            // Home
            // <video controls className="w-full h-full object-cover">
            //   <source
            //     src={`http://192.168.1.101:5000/recordings/${latestRecording}`}
            //     type="video/mp4"
            //   />
            //   Your browser does not support the video tag.
            // </video>
            // School
            <video controls className="w-full h-full object-cover">
            <source
              src={`http://172.17.10.188:5000/recordings/${latestRecording}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          ) : (
            <div className="text-white text-center p-4">
              <p className="text-lg font-medium">No Recording Available</p>
              <p className="text-sm mt-2">Please check back later</p>
            </div>
          )}
        </div>
      )}

      {/* Optional shutdown overlay if some other code sets shutdown=true */}
      {shutdown && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-75 z-20">
          <div className="text-white text-xl font-bold">
            SYSTEM SHUTDOWN!
          </div>
        </div>
      )}

      {/* Example stealth meter UI */}
      <StealthMeter level={stealthLevel} />

      {/* Play/pause & volume controls */}
      <VideoControls
        isPlaying={isPlaying}
        volume={volume}
        onPlayToggle={handlePlayToggle}
        onVolumeChange={setVolume}
        disabled={mode === 'live' && shutdown}
      />
    </div>
  );
};

export default VideoFeed;