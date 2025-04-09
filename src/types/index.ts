export interface Event {
  id: string;
  timestamp: string;
  description: string;
  type: 'manual' | 'auto';
}

export interface MovementData {
  speed: number;
  direction: string;
  tilt: number;
}

export type Mode = 'live' | 'review';

export interface ApiResponse<T = any> {
  status: 'ok' | 'error';
  simulation_mode?: boolean;
  message?: string;
  data?: T;
}

export interface StreamResponse {
  status: 'ok' | 'simulation_mode';
  stream_url: string | null;
  simulation_mode: boolean;
}

export interface DistanceResponse {
  status: 'ok' | 'error';
  distance: number;
  simulation_mode?: boolean;
  message?: string;
}