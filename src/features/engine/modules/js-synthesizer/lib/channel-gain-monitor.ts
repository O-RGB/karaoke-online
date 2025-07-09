export class ChannelGainMonitor {
  private analysers: AnalyserNode[];
  private splitters: ChannelSplitterNode[];
  private gainNodes: GainNode[];
  private merger: ChannelMergerNode | undefined;
  private dataArrays: Float32Array[];
  private initialized: boolean = false;

  constructor(
    private audioContext: AudioContext,
    private channels: number = 16
  ) {
    this.analysers = [];
    this.splitters = [];
    this.gainNodes = [];
    this.dataArrays = [];
  }

  // เพิ่ม getter สำหรับ analysers
  get analyserNodes(): AnalyserNode[] {
    return this.analysers;
  }

  initialize() {
    if (this.initialized) return;

    // Create channel splitter for each pair of channels
    for (let i = 0; i < this.channels; i += 2) {
      const splitter = this.audioContext.createChannelSplitter(2);
      this.splitters.push(splitter);
    }

    // Create analyzer and gain node for each channel
    for (let i = 0; i < this.channels; i++) {
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 1.0;

      this.analysers.push(analyser);
      this.gainNodes.push(gainNode);
      this.dataArrays.push(new Float32Array(analyser.frequencyBinCount));
    }

    // Create merger to combine all channels
    this.merger = this.audioContext.createChannelMerger(this.channels);

    this.initialized = true;
  }

  connectToSynth(synthNode: AudioNode) {
    this.initialize();

    if (!this.merger) {
      return;
    }

    // Connect synth output to splitters
    for (let i = 0; i < this.channels; i += 2) {
      synthNode.connect(this.splitters[i / 2]);
    }

    // Connect each splitter output to corresponding analyzer and gain node
    for (let i = 0; i < this.channels; i++) {
      const splitterIndex = Math.floor(i / 2);
      const splitterChannel = i % 2;

      this.splitters[splitterIndex].connect(this.gainNodes[i], splitterChannel);
      this.gainNodes[i].connect(this.analysers[i]);
      this.gainNodes[i].connect(this.merger, 0, i);
    }

    // Connect merger to destination
    this.merger.connect(this.audioContext.destination);
  }

  getChannelGain(channel: number): number {
    if (channel < 0 || channel >= this.channels) return 0;

    const analyser = this.analysers[channel];
    const dataArray = this.dataArrays[channel];

    analyser.getFloatTimeDomainData(dataArray);

    // Calculate RMS value
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }

    return Math.sqrt(sum / dataArray.length);
  }

  setChannelGain(channel: number, value: number) {
    if (channel >= 0 && channel < this.channels) {
      this.gainNodes[channel].gain.value = value;
    }
  }

  getAllChannelGains(): number[] {
    return Array.from({ length: this.channels }, (_, i) =>
      this.getChannelGain(i)
    );
  }
}
