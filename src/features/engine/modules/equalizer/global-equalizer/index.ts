import { EQPreset } from "../types/equalizer.type";

/* =======================
   Interfaces
======================= */

export interface CompressorParams {
  threshold: number; // dB
  ratio: number; // 1..20
  knee: number; // 0..40
  attack: number; // seconds
  release: number; // seconds
}

export interface ReverbParams {
  mix: number; // 0..1
  duration: number; // seconds
  decay: number;
  preDelay: number; // seconds
}

export interface LimiterParams {
  threshold: number; // dB
  release: number; // seconds
}

/* =======================
   Global Equalizer
======================= */

export class GlobalEqualizer {
  private audioContext: BaseAudioContext;

  // Core Nodes
  private inputNode: GainNode;
  private outputNode: GainNode;
  private masterGainNode: GainNode;
  private analyserNode: AnalyserNode;

  // Processors
  private eqNodes: BiquadFilterNode[] = [];
  private compressorNode: DynamicsCompressorNode;
  private waveShaperNode: WaveShaperNode;
  private pannerNode: StereoPannerNode;

  // Reverb
  private reverbNode: ConvolverNode;
  private reverbGainNode: GainNode;

  // Limiter
  private limiterNode: DynamicsCompressorNode;

  // State
  public isEnabled = true;

  public frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  public gains: number[] = new Array(10).fill(0);

  public compParams: CompressorParams = {
    threshold: -24,
    ratio: 1,
    knee: 30,
    attack: 0.003,
    release: 0.25,
  };

  public reverbParams: ReverbParams = {
    mix: 0,
    duration: 2.5,
    decay: 2.0,
    preDelay: 0.02,
  };

  public limiterParams: LimiterParams = {
    threshold: -0.5,
    release: 0.1,
  };

  public saturationAmount = 0;
  public panValue = 0;
  public masterVolume = 1.0;

  private lastRms = 0;

  /* =======================
     Constructor
  ======================= */

  constructor(context: BaseAudioContext) {
    this.audioContext = context;

    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.masterGainNode = context.createGain();

    this.analyserNode = context.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.compressorNode = context.createDynamicsCompressor();
    this.waveShaperNode = context.createWaveShaper();
    this.waveShaperNode.oversample = "4x";

    this.pannerNode = context.createStereoPanner();

    this.reverbNode = context.createConvolver();
    this.reverbGainNode = context.createGain();
    this.reverbGainNode.gain.value = 0;

    this.limiterNode = context.createDynamicsCompressor();
    this.limiterNode.knee.value = 0;
    this.limiterNode.ratio.value = 20;
    this.limiterNode.attack.value = 0.001;

    this.updateCompressorNode();
    this.updateLimiterNode();
    this.updateImpulseResponse();

    this.boot();
  }

  /* =======================
     Boot
  ======================= */

  private boot() {
    this.createEQNodes();
    this.connectGraph();
  }

  /* =======================
     EQ
  ======================= */

  private createEQNodes() {
    this.eqNodes = this.frequencies.map((freq, i) => {
      const f = this.audioContext.createBiquadFilter();
      f.type = "peaking";
      f.frequency.value = freq;
      f.Q.value = 1.2;
      f.gain.value = this.gains[i];
      return f;
    });
  }

  /* =======================
     Graph
  ======================= */

  private connectGraph() {
    this.disconnectAll();

    if (!this.isEnabled) {
      this.inputNode.connect(this.analyserNode);
      this.analyserNode.connect(this.outputNode);
      return;
    }

    let node: AudioNode = this.inputNode;

    for (let i = 0; i < this.eqNodes.length; i++) {
      node.connect(this.eqNodes[i]);
      node = this.eqNodes[i];
    }

    node.connect(this.compressorNode);
    node = this.compressorNode;

    node.connect(this.waveShaperNode);
    node = this.waveShaperNode;

    node.connect(this.pannerNode);

    // Dry
    this.pannerNode.connect(this.limiterNode);

    // Wet
    this.pannerNode.connect(this.reverbGainNode);
    this.reverbGainNode.connect(this.reverbNode);
    this.reverbNode.connect(this.limiterNode);

    this.limiterNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.outputNode);
  }

  private disconnectAll() {
    this.inputNode.disconnect();
    for (let i = 0; i < this.eqNodes.length; i++) this.eqNodes[i].disconnect();
    this.compressorNode.disconnect();
    this.waveShaperNode.disconnect();
    this.pannerNode.disconnect();
    this.reverbGainNode.disconnect();
    this.reverbNode.disconnect();
    this.limiterNode.disconnect();
    this.masterGainNode.disconnect();
    this.analyserNode.disconnect();
  }

  /* =======================
     Reverb (Custom IR)
  ======================= */

  private createImpulseResponse(
    duration: number,
    decay: number,
    preDelay: number
  ): AudioBuffer {
    const sr = this.audioContext.sampleRate;
    const length = sr * duration;
    const impulse = this.audioContext.createBuffer(2, length, sr);
    const preDelaySamples = Math.floor(preDelay * sr);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let lastOut = 0;
      const alpha = 0.12;

      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut += alpha * (white - lastOut);

        if (i < preDelaySamples) {
          data[i] = 0;
        } else {
          const t = (i - preDelaySamples) / (length - preDelaySamples);
          const env = Math.exp(-decay * t);
          const wobble = 1 + 0.1 * Math.sin(t * 20);
          data[i] = lastOut * env * wobble;
        }
      }
    }

    return impulse;
  }

  private updateImpulseResponse() {
    const { duration, decay, preDelay } = this.reverbParams;
    this.reverbNode.buffer = this.createImpulseResponse(
      duration,
      decay,
      preDelay
    );
  }

  /* =======================
     Updates
  ======================= */

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

  private makeDistortionCurve(amount: number) {
    const n = 44100;
    const curve = new Float32Array(n);
    const k = amount;
    const deg = Math.PI / 180;

    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /* =======================
     Public API
  ======================= */

  public setBandGain(index: number, gain: number) {
    if (!this.eqNodes[index]) return;
    this.eqNodes[index].gain.setTargetAtTime(
      gain,
      this.audioContext.currentTime,
      0.1
    );
  }

  public applyPreset(preset: EQPreset) {
    preset.gains.forEach((g, i) => this.setBandGain(i, g));
  }

  public setCompressor(params: Partial<CompressorParams>) {
    this.compParams = { ...this.compParams, ...params };
    this.updateCompressorNode();
  }

  public setLimiter(params: Partial<LimiterParams>) {
    this.limiterParams = { ...this.limiterParams, ...params };
    this.updateLimiterNode();
  }

  public setReverb(params: Partial<ReverbParams>) {
    const updateIR =
      params.duration !== undefined ||
      params.decay !== undefined ||
      params.preDelay !== undefined;

    this.reverbParams = { ...this.reverbParams, ...params };

    if (updateIR) this.updateImpulseResponse();

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

  /* =======================
     IO / Meter
  ======================= */

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
    const buf = new Float32Array(this.analyserNode.fftSize);
    this.analyserNode.getFloatTimeDomainData(buf);

    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const s = buf[i];
      sum += s * s;
    }

    const rms = Math.sqrt(sum / buf.length);
    this.lastRms = Math.max(rms, this.lastRms * 0.9);
    return Math.min(this.lastRms * 100, 100);
  }
}
