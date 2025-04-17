import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, AlertOctagon } from 'lucide-react';
import { getDistance, getStatus } from '../../services/api';

export const StealthMeter: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [shutdown, setShutdown] = useState<boolean>(false);

  // Function to map distance (cm) to a stealth level (0-100).
  const mapDistanceToStealthLevel = (distance: number): number => {
    if (distance === -2) {
      console.log('Distance is -2 (no reading). Setting level to 0.');
      return 0;
    }
    if (distance < 30) {
      console.log('Distance less than 30cm: risk 100.');
      return 100;
    }
    if (distance > 200) {
      console.log('Distance greater than 200cm: safe (0).');
      return 0;
    }
    // Linear mapping between 30 and 200.
    const computed = Math.round(((200 - distance) * 100) / 170);
    console.log(`For distance ${distance}cm, computed level is ${computed}.`);
    return computed;
  };

  useEffect(() => {
    let distanceInterval: NodeJS.Timeout;

    // Poll status first. If shutdown, stop distance polling.
    const pollStatusAndDistance = async () => {
      try {
        const statusRes = await getStatus();
        if (statusRes.data.shutdown) {
          console.log("Shutdown signalled; stopping distance fetch.");
          setShutdown(true);
          clearInterval(distanceInterval);
          return;
        } else {
          setShutdown(false);
        }
        // Fetch distance if not shutdown.
        const distanceRes = await getDistance();
        const distance = distanceRes.data.distance;
        console.log('Fetched distance:', distance);
        const newLevel = mapDistanceToStealthLevel(distance);
        setLevel(newLevel);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Start polling every 1000ms.
    pollStatusAndDistance(); // Initial fetch.
    distanceInterval = setInterval(pollStatusAndDistance, 1000);
    
    return () => clearInterval(distanceInterval);
  }, []);

  const getStealthColor = (level: number) => {
    if (level <= 30) return 'bg-green-500';
    if (level <= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const StealthIcon = () => {
    if (level <= 30)
      return <Shield className="h-6 w-6 text-green-700" />;
    if (level <= 70)
      return <AlertTriangle className="h-6 w-6 text-orange-700" />;
    return <AlertOctagon className="h-6 w-6 text-red-700" />;
  };

  return (
    <div className="absolute left-2 sm:left-4 top-8 sm:top-12 flex flex-col items-center">
      <span className="text-[10px] sm:text-xs font-medium text-white bg-black bg-opacity-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded mb-1">
        Stealth Meter
      </span>
      <div className="relative h-32 sm:h-48 w-4 sm:w-6 bg-gray-800 rounded overflow-hidden">
        <div
          className={`absolute bottom-0 w-full transition-all duration-300 ${getStealthColor(level)}`}
          style={{ height: `${level}%` }}
        />
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
          <StealthIcon />
        </div>
      </div>
    </div>
  );
};

export default StealthMeter;