import axios from 'axios';
import { io } from 'socket.io-client';
import type { ApiResponse, StreamResponse, DistanceResponse } from '../types';

// Use a single base URL (update this as needed).
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.101:5000';

// Create the axios instance for the single Flask server.
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// Create socket instance (if needed elsewhere)
export const socket = io(API_URL, {
  autoConnect: false,
});

// Movement controls (mapping directions to actions).
export const moveRobot = async (
  direction: 'up' | 'down' | 'left' | 'right' | 'look-up' | 'look-down'
) => {
  let action: string;
  switch (direction) {
    case 'up':
      action = 'forward';
      break;
    case 'down':
      action = 'backward';
      break;
    case 'left':
      action = 'turn_left';
      break;
    case 'right':
      action = 'turn_right';
      break;
    case 'look-up':
      action = 'look_up';
      break;
    case 'look-down':
      action = 'look_down';
      break;
    default:
      action = direction;
  }
  // Using a default speed of 90; adjust if needed.
  return api.post<ApiResponse>('/movement', { action, speed: 90 });
};

export const setSpeed = async (speed: number) => {
  return api.post<ApiResponse>('/speed', { speed });
};

export const getDistance = async () => {
  return api.get<DistanceResponse>('/distance');
};

export const triggerDeadAction = async () => {
  return api.post<ApiResponse>('/dead');
};

export const playSound = async (type: 'death' | 'distraction') => {
  return api.post<ApiResponse>('/play-sound', { type });
};

export const takePhoto = async () => {
  return api.post<ApiResponse>('/camera/photo');
};

export const addEvent = async (description: string) => {
  return api.post<ApiResponse>('/events', { description });
};

export const getEvents = async () => {
  return api.get<ApiResponse>('/events');
};

// New helper: getStatus polls the /status endpoint.
export const getStatus = async () => {
  return api.get<ApiResponse>('/status');
};

// New helper: getLatestRecording polls the /latest endpoint.
// Expects a response such as { latest: "2023-07-05-15.30.00.mp4" }.
export const getLatestRecording = async () => {
  return api.get<ApiResponse>('/latest');
};

// New helper: pauseVideoStream sends a POST to /pause to stop video recording.
export const pauseVideoStream = async () => {
  return api.post<ApiResponse>('/pause');
};

export default api;