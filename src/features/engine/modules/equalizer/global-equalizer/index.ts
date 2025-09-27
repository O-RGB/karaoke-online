import { EQPreset } from "../types/equalizer.type";

export class GlobalEqualizer {
  private audioContext: BaseAudioContext;
  private eqNodes: BiquadFilterNode[] = [];
  private inputNode: GainNode;
  private outputNode: GainNode;
  private analyserNode: AnalyserNode;
  private analyserDataArray: Uint8Array;

  public isEnabled: boolean = true;
  public frequencies: number[] = [
    32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
  ];
  public gains: number[] = new Array(10).fill(0);

  constructor(context: BaseAudioContext) {
    this.audioContext = context;
    this.inputNode = this.audioContext.createGain();
    this.outputNode = this.audioContext.createGain();

    // Setup analyser
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 32;
    this.analyserDataArray = new Uint8Array(
      this.analyserNode.frequencyBinCount
    );

    this.boot();
  }

  public boot(): void {
    this.createEQNodes();
    this.connectGraph();
  }

  private createEQNodes(): void {
    this.eqNodes = this.frequencies.map((frequency, index) => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = frequency;
      filter.Q.value = 1.2;
      filter.gain.value = this.gains[index];
      return filter;
    });
  }

  private connectGraph(): void {
    this.inputNode.disconnect();

    let current: AudioNode = this.inputNode;
    if (this.isEnabled && this.eqNodes.length) {
      for (const eq of this.eqNodes) {
        current.connect(eq);
        current = eq;
      }
    }

    current.connect(this.analyserNode);
    this.analyserNode.connect(this.outputNode);
  }

  public toggleEQ(enabled: boolean): void {
    if (this.isEnabled !== enabled) {
      this.isEnabled = enabled;
      this.connectGraph();
    }
  }

  public setBandGain(index: number, gain: number): void {
    if (this.eqNodes[index]) {
      this.gains[index] = gain;
      const time = this.audioContext.currentTime;
      const eq = this.eqNodes[index];
      eq.gain.cancelScheduledValues(time);
      eq.gain.linearRampToValueAtTime(gain, time + 0.05);
    }
  }

  public applyPreset(preset: EQPreset): void {
    preset.gains.forEach((gain, index) => {
      if (index < this.eqNodes.length) {
        this.setBandGain(index, gain);
      }
    });
  }

  public reset(): void {
    this.gains = this.gains.map(() => 0);
    this.gains.forEach((_, i) => this.setBandGain(i, 0));
  }

  public get input(): AudioNode {
    return this.inputNode;
  }

  public get output(): AudioNode {
    return this.outputNode;
  }

  public getAnalyser(): AnalyserNode {
    return this.analyserNode;
  }

  private lastRms = 0;

  public getVolumeLevel(): number {
    const buffer = new Float32Array(this.analyserNode.fftSize);
    this.analyserNode.getFloatTimeDomainData(buffer);

    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i] ** 2;
    const rms = Math.sqrt(sumSquares / buffer.length);

    this.lastRms = this.lastRms * 0.8 + rms * 0.2;

    return this.lastRms * 100;
  }
}
