import axios from 'axios';
import { io } from 'socket.io-client';
import type { ApiResponse, StreamResponse, DistanceResponse } from '../types';

// const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.101:5000';
const API_URL = import.meta.env.VITE_API_URL || 'http://172.17.10.188:5000';

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
export const moveRobot = async (direction: 'up' | 'down' | 'left' | 'right') => {
  return api.post<ApiResponse>('/robot/move', { direction });
};

export const setSpeed = async (speed: number) => {
  return api.post<ApiResponse>('/robot/speed', { speed });
};

// Sensor data
export const getDistance = async () => {
  return api.get<DistanceResponse>('/robot/distance');
};

// Special actions
export const triggerDeadAction = async () => {
  return api.post<ApiResponse>('/robot/dead');
};

export const playSound = async (type: 'death' | 'distraction') => {
  return api.post<ApiResponse>('/robot/play-sound', { type });
};

// Camera functions
export const takePhoto = async () => {
  return api.post<ApiResponse>('/robot/camera/photo');
};

// Event management
export const addEvent = async (description: string) => {
  return api.post<ApiResponse>('/events', { description });
};

export const getEvents = async () => {
  return api.get<ApiResponse>('/events');
};



export default api;