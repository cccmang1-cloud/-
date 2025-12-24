
export enum GestureType {
  NONE = 'NONE',
  FIST = 'FIST',
  OPEN = 'OPEN',
  PINCH = 'PINCH'
}

export interface HandPosition {
  x: number;
  y: number;
}

export interface PhotoData {
  id: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface AppState {
  gesture: GestureType;
  handPosition: HandPosition;
  isMusicPlaying: boolean;
  photos: PhotoData[];
  isLoading: boolean;
}
