import axios from 'axios';
import { io } from 'socket.io-client';
import type { ApiResponse, StreamResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://172.17.10.188:5000';
// const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.101:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// Create socket instance
export const socket = io(API_URL, {
  autoConnect: false,
});

// Movement controls
// Allowed actions: "forward", "backward", "turn_left", "turn_right", "look_up", "look_down", "act_dead"
export const moveRobot = async (
  action: 'forward' | 'backward' | 'turn_left' | 'turn_right' | 'look_up' | 'look_down' | 'act_dead',
  speed?: number
) => {
  return api.post<ApiResponse>('/movement', { action, speed });
};

// Camera/photo functions
export const takePhoto = async () => {
  return api.post<ApiResponse>('/photo');
};

// Vision functions
export const setColorDetection = async (index: number) => {
  // index: 0 => close/off, 1: red, 2: orange, 3: yellow, 4: green, 5: blue, 6: purple
  return api.post<ApiResponse>('/color', { index });
};

export const toggleQRDetection = async () => {
  return api.post<ApiResponse>('/qr');
};

export const toggleFaceDetection = async () => {
  return api.post<ApiResponse>('/face');
};

export const getObjectInfo = async () => {
  return api.get<ApiResponse>('/object-info');
};

// Recording control
export const controlRecording = async (action: 'toggle' | 'stop') => {
  return api.post<ApiResponse>('/record', { action });
};

// Sound control (plays a distraction sound)
export const playSound = async () => {
  return api.post<ApiResponse>('/sound');
};

export default api;