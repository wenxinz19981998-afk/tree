export interface BlessingResponse {
  message: string;
  mood: 'elegant' | 'joyful' | 'mysterious';
}

export interface TreeConfig {
  rotationSpeed: number;
  lightsIntensity: number;
  bloomIntensity: number;
}
