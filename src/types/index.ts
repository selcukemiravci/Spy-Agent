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