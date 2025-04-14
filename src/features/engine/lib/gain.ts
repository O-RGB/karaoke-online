export class AudioMeter {
  private analysers: AnalyserNode[] = [];

  constructor(analysers: AnalyserNode[]) {
    this.analysers = analysers;
  }

  public gainChannels() {
    return this.analysers?.map((analyser) => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const value = Math.round(
        dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
      );
      return value;
    });
  }
}
export class AudioEqualizer {
  private audioContext: AudioContext;
  private isEnabled: boolean = true;
  private eqNodes: BiquadFilterNode[] = [];
  private bypassNode: GainNode;

  // ลดเหลือ 3 ย่าน: ต่ำ กลาง สูง
  private frequencies: number[] = [100, 1000, 10000];
  private gains: number[] = [0, 0, 0];

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.bypassNode = this.audioContext.createGain();
    this.bypassNode.gain.value = 1.0;
  }

  private createEQ(
    frequencies: number[],
    gains: number[],
    types: string[] = []
  ): BiquadFilterNode[] {
    const validTypes: BiquadFilterType[] = [
      "lowpass",
      "highpass",
      "bandpass",
      "lowshelf",
      "highshelf",
      "peaking",
      "notch",
      "allpass",
    ];

    return frequencies.map((frequency, index) => {
      const eqNode = this.audioContext.createBiquadFilter();
      eqNode.frequency.value = frequency;
      eqNode.gain.value = gains[index] ?? 0;
      eqNode.Q.value = 1.0;

      const type = types[index] ?? "peaking";
      eqNode.type = validTypes.includes(type as BiquadFilterType)
        ? (type as BiquadFilterType)
        : "peaking";

      return eqNode;
    });
  }

  public connectEQ(): AudioNode[] {
    const types: string[] = [
      "lowshelf", // ต่ำ
      "peaking", // กลาง
      "highshelf", // สูง
    ];

    this.eqNodes = this.createEQ(this.frequencies, this.gains, types);

    // เชื่อมต่อโหนดต่อกันเป็นชุด
    for (let i = 0; i < this.eqNodes.length - 1; i++) {
      this.eqNodes[i].connect(this.eqNodes[i + 1]);
    }

    return [
      this.eqNodes[0],
      this.eqNodes[this.eqNodes.length - 1],
      this.bypassNode,
    ];
  }

  public toggleEQ(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isEQEnabled(): boolean {
    return this.isEnabled;
  }

  public updateBandGain(bandIndex: number, gainValue: number): void {
    if (bandIndex >= 0 && bandIndex < this.eqNodes.length) {
      this.gains[bandIndex] = gainValue;
      this.eqNodes[bandIndex].gain.value = gainValue;
    }
  }

  public resetEQ(): void {
    this.eqNodes.forEach((node, index) => {
      this.gains[index] = 0;
      node.gain.value = 0;
    });
  }

  public getEQSettings(): { frequency: number; gain: number }[] {
    return this.eqNodes.map((node, index) => ({
      frequency: this.frequencies[index],
      gain: node.gain.value,
    }));
  }
}
