import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  return api.post('/robot/move', { direction });
};

export const setSpeed = async (speed: number) => {
  return api.post('/robot/speed', { speed });
};

// Event management
export const addEvent = async (description: string) => {
  return api.post('/events', { description });
};

export const getEvents = async () => {
  return api.get('/events');
};

// Video stream
export const startVideoStream = () => {
  socket.connect();
};

export const stopVideoStream = () => {
  socket.disconnect();
};

export default api;