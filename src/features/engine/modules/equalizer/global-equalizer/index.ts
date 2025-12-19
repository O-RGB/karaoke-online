import { EQPreset } from "../types/equalizer.type";

// Interface สำหรับรับค่า Parameter แบบละเอียด
export interface CompressorParams {
  threshold: number; // dB (-100 to 0)
  ratio: number; // 1 to 20
  knee: number; // 0 to 40
  attack: number; // 0 to 1 (seconds)
  release: number; // 0 to 1 (seconds)
}

export interface ReverbParams {
  mix: number; // 0 to 1
  duration: number; // seconds
  decay: number; // exponential decay factor
}

export interface LimiterParams {
  threshold: number; // Ceiling (-20 to 0 dB)
  release: number; // seconds
}

export class GlobalEqualizer {
  private audioContext: BaseAudioContext;

  // --- Nodes ---
  private inputNode: GainNode;
  private masterGainNode: GainNode;
  private analyserNode: AnalyserNode;
  private outputNode: GainNode;

  // Processors
  private eqNodes: BiquadFilterNode[] = [];
  private compressorNode: DynamicsCompressorNode;
  private waveShaperNode: WaveShaperNode; // Saturation
  private pannerNode: StereoPannerNode;

  // Reverb System
  private reverbNode: ConvolverNode;
  private reverbGainNode: GainNode;

  // Limiter System
  private limiterNode: DynamicsCompressorNode;

  // --- State ---
  public isEnabled: boolean = true;
  public frequencies: number[] = [
    32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
  ];
  public gains: number[] = new Array(10).fill(0);

  // Default Params (Pro Standard Defaults)
  public compParams: CompressorParams = {
    threshold: -24,
    ratio: 1, // 1:1 = Bypass
    knee: 30, // Soft knee
    attack: 0.003, // 3ms
    release: 0.25, // 250ms
  };

  public saturationAmount: number = 0;
  public panValue: number = 0;

  public reverbParams: ReverbParams = {
    mix: 0,
    duration: 2.5,
    decay: 2.0,
  };

  public limiterParams: LimiterParams = {
    threshold: -0.5, // Ceiling
    release: 0.1,
  };

  public masterVolume: number = 1.0;

  // Internal visualizer state
  private lastRms = 0;

  constructor(context: BaseAudioContext) {
    this.audioContext = context;

    // 1. Init Base Nodes
    this.inputNode = this.audioContext.createGain();
    this.masterGainNode = this.audioContext.createGain();
    this.outputNode = this.audioContext.createGain();

    // Analyser
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // 2. Create Processors
    // Compressor
    this.compressorNode = this.audioContext.createDynamicsCompressor();
    this.updateCompressorNode();

    // Saturation
    this.waveShaperNode = this.audioContext.createWaveShaper();
    this.waveShaperNode.oversample = "4x";

    // Panner
    this.pannerNode = this.audioContext.createStereoPanner();

    // Reverb
    this.reverbNode = this.audioContext.createConvolver();
    this.reverbGainNode = this.audioContext.createGain();
    this.reverbGainNode.gain.value = 0;
    this.updateImpulseResponse();

    // Limiter (Brickwall Config)
    this.limiterNode = this.audioContext.createDynamicsCompressor();
    this.limiterNode.knee.value = 0; // Hard knee
    this.limiterNode.ratio.value = 20; // Infinity ratio
    this.limiterNode.attack.value = 0.001; // Instant attack
    this.updateLimiterNode();

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
      filter.Q.value = 1.2; // Standard Graphic EQ Q
      filter.gain.value = this.gains[index];
      return filter;
    });
  }

  // Chain: Input -> EQ -> Comp -> Saturation -> Panner -> (Split Reverb) -> Limiter -> Master -> Output
  private connectGraph(): void {
    this.disconnectAll();

    if (!this.isEnabled) {
      this.inputNode.connect(this.analyserNode);
      this.analyserNode.connect(this.outputNode);
      return;
    }

    let current: AudioNode = this.inputNode;

    // 1. EQ
    for (const eq of this.eqNodes) {
      current.connect(eq);
      current = eq;
    }

    // 2. Compressor
    current.connect(this.compressorNode);
    current = this.compressorNode;

    // 3. Saturation (Drive)
    current.connect(this.waveShaperNode);
    current = this.waveShaperNode;

    // 4. Panner
    current.connect(this.pannerNode);

    // 5. Reverb Split
    // Dry Path
    this.pannerNode.connect(this.limiterNode);
    // Wet Path
    this.pannerNode.connect(this.reverbGainNode);
    this.reverbGainNode.connect(this.reverbNode);
    this.reverbNode.connect(this.limiterNode);

    // 6. Final Limiter & Master
    this.limiterNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.outputNode);
  }

  private disconnectAll() {
    this.inputNode.disconnect();
    this.eqNodes.forEach((n) => n.disconnect());
    this.compressorNode.disconnect();
    this.waveShaperNode.disconnect();
    this.pannerNode.disconnect();
    this.reverbGainNode.disconnect();
    this.reverbNode.disconnect();
    this.limiterNode.disconnect();
    this.masterGainNode.disconnect();
    this.analyserNode.disconnect();
  }

  // --- Internal Updates ---

  private updateCompressorNode() {
    const t = this.audioContext.currentTime;
    this.compressorNode.threshold.setValueAtTime(this.compParams.threshold, t);
    this.compressorNode.ratio.setValueAtTime(this.compParams.ratio, t);
    this.compressorNode.knee.setValueAtTime(this.compParams.knee, t);
    this.compressorNode.attack.setValueAtTime(this.compParams.attack, t);
    this.compressorNode.release.setValueAtTime(this.compParams.release, t);
  }

  private updateLimiterNode() {
    const t = this.audioContext.currentTime;
    this.limiterNode.threshold.setValueAtTime(this.limiterParams.threshold, t);
    this.limiterNode.release.setValueAtTime(this.limiterParams.release, t);
  }

  private updateImpulseResponse() {
    const rate = this.audioContext.sampleRate;
    const length = rate * this.reverbParams.duration;
    const impulse = this.audioContext.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    const decay = this.reverbParams.decay;

    for (let i = 0; i < length; i++) {
      const n = i;
      const e = Math.pow(1 - n / length, decay);
      // Simple white noise with exponential decay
      left[i] = (Math.random() * 2 - 1) * e;
      right[i] = (Math.random() * 2 - 1) * e;
    }
    this.reverbNode.buffer = impulse;
  }

  private makeDistortionCurve(amount: number) {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      let x = (i * 2) / n_samples - 1;
      // Classic sigmoid soft-clipping
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // --- Public API (Setters) ---

  public setCompressor(params: Partial<CompressorParams>) {
    this.compParams = { ...this.compParams, ...params };
    this.updateCompressorNode();
  }

  public setLimiter(params: Partial<LimiterParams>) {
    this.limiterParams = { ...this.limiterParams, ...params };
    this.updateLimiterNode();
  }

  public setReverb(params: Partial<ReverbParams>) {
    const shouldUpdateIR =
      params.duration !== undefined || params.decay !== undefined;
    this.reverbParams = { ...this.reverbParams, ...params };

    if (shouldUpdateIR) this.updateImpulseResponse();
    if (params.mix !== undefined) {
      this.reverbGainNode.gain.setTargetAtTime(
        params.mix,
        this.audioContext.currentTime,
        0.05
      );
    }
  }

  public setSaturation(amount: number) {
    this.saturationAmount = amount;
    this.waveShaperNode.curve =
      amount > 0 ? this.makeDistortionCurve(amount) : null;
  }

  public setPan(value: number) {
    this.panValue = value;
    this.pannerNode.pan.setValueAtTime(value, this.audioContext.currentTime);
  }

  public setMasterGain(value: number) {
    this.masterVolume = value;
    this.masterGainNode.gain.setTargetAtTime(
      value,
      this.audioContext.currentTime,
      0.05
    );
  }

  public toggleEQ(enabled: boolean) {
    this.isEnabled = enabled;
    this.connectGraph();
  }

  public setBandGain(index: number, gain: number) {
    if (this.eqNodes[index]) {
      this.gains[index] = gain;
      this.eqNodes[index].gain.setTargetAtTime(
        gain,
        this.audioContext.currentTime,
        0.1
      );
    }
  }

  public applyPreset(preset: EQPreset) {
    preset.gains.forEach((g, i) => this.setBandGain(i, g));
  }

  public reset() {
    this.gains.fill(0);
    this.gains.forEach((_, i) => this.setBandGain(i, 0));
    this.setSaturation(0);
    this.setPan(0);
    this.setCompressor({
      threshold: -24,
      ratio: 1,
      knee: 30,
      attack: 0.003,
      release: 0.25,
    });
    this.setLimiter({ threshold: -0.5, release: 0.1 });
    this.setReverb({ mix: 0 });
    this.setMasterGain(1.0);
  }

  // --- Getters ---
  public get input() {
    return this.inputNode;
  }
  public get output() {
    return this.outputNode;
  }
  public getAnalyser() {
    return this.analyserNode;
  }

  public getEQValues(): number[] {
    return this.eqNodes.map((node) => node.gain.value);
  }

  public getVolumeLevel(): number {
    const buffer = new Float32Array(this.analyserNode.fftSize);
    this.analyserNode.getFloatTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i] ** 2;
    const rms = Math.sqrt(sum / buffer.length);

    // Smooth meter
    this.lastRms = Math.max(rms, this.lastRms * 0.9); // Slow release visual
    return Math.min(this.lastRms * 100, 100);
  }
}
