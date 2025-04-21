export interface EQPreset {
  name: string;
  gains: number[];
  description?: string;
}

export interface EQConfig {
  enabled: boolean;
  gains: number[];
  boostLevel: number;
  inputVolume: number;
  outputVolume: number;
  volumeCompensation: number;
}
