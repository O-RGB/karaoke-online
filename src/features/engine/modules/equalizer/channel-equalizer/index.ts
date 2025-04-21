import { EQConfig } from "../types/equalizer.type";

export class ChannelEqualizer {
  private audioContext: AudioContext;
  private eqNodes: BiquadFilterNode[] = [];
  private bypassNode: GainNode;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private volumeCompensation: GainNode;
  private isEnabled: boolean = false;

  private boosterNode: GainNode;
  private isBoostEnabled: boolean = false;
  private boostLevel: number = 0;
  private maxBoostLevel: number = 5.0;

  private compressorNode: DynamicsCompressorNode;
  private isCompressorEnabled: boolean = false;

  // เพิ่ม analyser สำหรับ volume visualizer
  private analyserNode: AnalyserNode;
  private analyserDataArray: Uint8Array;
  private isVisualizerEnabled: boolean = false;

  public frequencies: number[] = [100, 1000, 10000];
  public gains: number[] = [0, 0, 0];
  private defaultCompensation: number = 0.8;

  constructor(audioContext: AudioContext, inputAttenuation: number = 0.8) {
    this.audioContext = audioContext;
    this.defaultCompensation = inputAttenuation;

    this.inputNode = this.audioContext.createGain();
    this.outputNode = this.audioContext.createGain();
    this.bypassNode = this.audioContext.createGain();
    this.volumeCompensation = this.audioContext.createGain();
    this.boosterNode = this.audioContext.createGain();

    this.inputNode.gain.value = 1.0;
    this.outputNode.gain.value = 1.0;
    this.bypassNode.gain.value = 1.0;
    this.volumeCompensation.gain.value = this.defaultCompensation;
    this.boosterNode.gain.value = 1.0;

    this.compressorNode = this.audioContext.createDynamicsCompressor();
    this.compressorNode.threshold.value = -20;
    this.compressorNode.knee.value = 10;
    this.compressorNode.ratio.value = 4;
    this.compressorNode.attack.value = 0.005;
    this.compressorNode.release.value = 0.25;

    // สร้าง analyser node สำหรับ volume visualizer
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256; // ค่าต่ำเพียงพอสำหรับการวัดความดัง
    this.analyserDataArray = new Uint8Array(
      this.analyserNode.frequencyBinCount
    );

    this.toggleBoost(true);
    this.createEQ();
    this.connectGraph();
  }

  private createEQ(): void {
    const types: BiquadFilterType[] = ["lowshelf", "peaking", "highshelf"];

    this.eqNodes = this.frequencies.map((frequency, index) => {
      const eqNode = this.audioContext.createBiquadFilter();
      eqNode.type = types[index];
      eqNode.frequency.value = frequency;
      eqNode.gain.value = this.gains[index] ?? 0;
      eqNode.Q.value = types[index] === "peaking" ? 0.8 : 0.7;
      return eqNode;
    });
  }

  private connectGraph(): void {
    this.inputNode.disconnect();
    this.bypassNode.disconnect();
    this.volumeCompensation.disconnect();
    this.compressorNode.disconnect();
    this.boosterNode.disconnect();
    this.analyserNode.disconnect();
    this.eqNodes.forEach((node) => node.disconnect());

    this.inputNode.connect(this.volumeCompensation);

    if (this.isEnabled) {
      this.volumeCompensation.connect(this.eqNodes[0]);
      for (let i = 0; i < this.eqNodes.length - 1; i++) {
        this.eqNodes[i].connect(this.eqNodes[i + 1]);
      }

      let lastNode: AudioNode = this.eqNodes[this.eqNodes.length - 1];

      if (this.isCompressorEnabled) {
        lastNode.connect(this.compressorNode);
        lastNode = this.compressorNode;
      }

      lastNode.connect(this.boosterNode);
      this.boosterNode.connect(this.outputNode);

      // เชื่อมต่อ analyser node ก่อนส่งไปที่ output
      this.boosterNode.connect(this.analyserNode);

      this.setBoostLevel(100);
    } else {
      this.volumeCompensation.connect(this.bypassNode);
      this.bypassNode.connect(this.boosterNode);
      this.boosterNode.connect(this.outputNode);

      // เชื่อมต่อ analyser node ก่อนส่งไปที่ output
      this.boosterNode.connect(this.analyserNode);

      this.setBoostLevel(0);
    }
  }

  // EQ
  public toggleEQ(enabled: boolean): void {
    if (this.isEnabled !== enabled) {
      this.isEnabled = enabled;
      this.connectGraph();
    }
  }

  public updateBandGain(bandIndex: number, gainValue: number): void {
    if (bandIndex >= 0 && bandIndex < this.eqNodes.length) {
      this.gains[bandIndex] = gainValue;

      const time = this.audioContext.currentTime;
      const eq = this.eqNodes[bandIndex];
      eq.gain.cancelScheduledValues(time);
      eq.gain.setValueAtTime(eq.gain.value, time);
      eq.gain.linearRampToValueAtTime(gainValue, time + 0.05);

      this.updateVolumeCompensation();
    }
  }

  private updateVolumeCompensation(): void {
    const maxGain = Math.max(...this.gains.map((g) => (g > 0 ? g : 0)));

    const time = this.audioContext.currentTime;
    const compensation =
      maxGain > 0
        ? this.defaultCompensation / (1 + maxGain * 0.05)
        : this.defaultCompensation;

    this.volumeCompensation.gain.linearRampToValueAtTime(
      compensation,
      time + 0.1
    );
  }

  public resetEQ(): void {
    this.eqNodes.forEach((node, index) => {
      this.gains[index] = 0;
      const time = this.audioContext.currentTime;
      node.gain.cancelScheduledValues(time);
      node.gain.linearRampToValueAtTime(0, time + 0.1);
    });

    const time = this.audioContext.currentTime;
    this.volumeCompensation.gain.linearRampToValueAtTime(
      this.defaultCompensation,
      time + 0.1
    );
  }

  // Booster
  public toggleBoost(enabled: boolean): void {
    this.isBoostEnabled = enabled;

    const time = this.audioContext.currentTime;
    this.boosterNode.gain.cancelScheduledValues(time);

    this.boosterNode.gain.linearRampToValueAtTime(
      enabled ? this.boostLevel : 0,
      time + 0.05
    );
  }

  public setBoostLevel(percentage: number): void {
    const normalized = Math.max(0, Math.min(500, percentage));
    this.boostLevel = Math.min(normalized / 100, this.maxBoostLevel);

    if (this.isBoostEnabled) {
      const time = this.audioContext.currentTime;
      this.boosterNode.gain.cancelScheduledValues(time);
      this.boosterNode.gain.linearRampToValueAtTime(
        this.boostLevel,
        time + 0.05
      );
    }
  }

  public getBoostLevel(): number {
    return this.boostLevel * 100;
  }

  public setMaxBoostLevel(maxLevel: number): void {
    this.maxBoostLevel = Math.max(1.0, maxLevel);
  }

  // Compressor
  public toggleCompressor(enabled: boolean): void {
    this.isCompressorEnabled = enabled;
    this.connectGraph();
  }

  public setCompressorSettings(settings: {
    threshold?: number;
    knee?: number;
    ratio?: number;
    attack?: number;
    release?: number;
  }): void {
    if (settings.threshold !== undefined) {
      this.compressorNode.threshold.value = settings.threshold;
    }
    if (settings.knee !== undefined) {
      this.compressorNode.knee.value = settings.knee;
    }
    if (settings.ratio !== undefined) {
      this.compressorNode.ratio.value = settings.ratio;
    }
    if (settings.attack !== undefined) {
      this.compressorNode.attack.value = settings.attack;
    }
    if (settings.release !== undefined) {
      this.compressorNode.release.value = settings.release;
    }
  }

  // Volume Controls
  public setVolumeCompensation(value: number): void {
    if (value > 0 && value <= 1) {
      this.defaultCompensation = value;
      this.volumeCompensation.gain.value = value;
      this.updateVolumeCompensation();
    }
  }

  public setInputVolume(value: number): void {
    if (value >= 0 && value <= 1) {
      this.inputNode.gain.value = value;
    }
  }

  public setOutputVolume(value: number): void {
    if (value >= 0 && value <= 1) {
      this.outputNode.gain.value = value;
    }
  }

  // Utility Getters
  public isEQEnabled(): boolean {
    return this.isEnabled;
  }

  public isBoostActive(): boolean {
    return this.isBoostEnabled;
  }

  public get input(): AudioNode {
    return this.inputNode;
  }

  public get output(): AudioNode {
    return this.outputNode;
  }

  // Volume Visualizer Methods
  public toggleVisualizer(enabled: boolean): void {
    this.isVisualizerEnabled = enabled;
  }

  /**
   * อ่านค่าระดับเสียงปัจจุบันและแปลงเป็นค่า 1-100
   * @returns ค่าระดับเสียงในช่วง 1-100
   */
  public getVolumeLevel(): number {
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    const value = Math.round(
      dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
    );

    return value;
  }

  public getAnalyser() {
    return this.analyserNode;
  }

  /**
   * ฟังก์ชันแบบต่อเนื่องที่จะเรียกฟังก์ชันคอลแบ็คกับค่าระดับเสียงทุกๆ ช่วงเวลาที่กำหนด
   * @param callback ฟังก์ชันที่จะถูกเรียกกับค่าระดับเสียง
   * @param interval ระยะเวลาในการเรียก (ms)
   * @returns ID ของ interval ที่สร้างขึ้น (สำหรับใช้ในการยกเลิก)
   */
  public startVolumeMonitoring(
    callback: (volume: number) => void,
    interval: number = 100
  ): number {
    this.toggleVisualizer(true);
    return window.setInterval(() => {
      callback(this.getVolumeLevel());
    }, interval);
  }

  /**
   * หยุดการมอนิเตอร์ระดับเสียง
   * @param intervalId ID ของ interval ที่ต้องการยกเลิก
   */
  public stopVolumeMonitoring(intervalId: number): void {
    window.clearInterval(intervalId);
  }

  /**
   * ใช้ config สำหรับปรับค่า EQ และการตั้งค่าอื่นๆ ทั้งหมดในครั้งเดียว
   * @param config ค่า configuration ต่างๆ สำหรับ equalizer
   */
  public applyConfig(config: EQConfig): void {
    this.toggleEQ(config.enabled);

    // ปรับแต่ละ band gain ตาม config
    if (config.gains && config.gains.length === this.eqNodes.length) {
      config.gains.forEach((gain, index) => {
        this.updateBandGain(index, gain);
      });
    }

    // ปรับ boost level ถ้ามีการระบุในค่า config
    if (config.boostLevel !== undefined) {
      this.setBoostLevel(config.boostLevel);
    }

    // ปรับ input volume ถ้ามีการระบุในค่า config
    if (
      config.inputVolume !== undefined &&
      config.inputVolume >= 0 &&
      config.inputVolume <= 1
    ) {
      this.setInputVolume(config.inputVolume);
    }

    // ปรับ output volume ถ้ามีการระบุในค่า config
    if (
      config.outputVolume !== undefined &&
      config.outputVolume >= 0 &&
      config.outputVolume <= 1
    ) {
      this.setOutputVolume(config.outputVolume);
    }

    // ปรับ volume compensation ถ้ามีการระบุในค่า config
    if (
      config.volumeCompensation !== undefined &&
      config.volumeCompensation > 0 &&
      config.volumeCompensation <= 1
    ) {
      this.setVolumeCompensation(config.volumeCompensation);
    }
  }

  /**
   * สร้าง config object จากการตั้งค่าปัจจุบัน
   * @returns EQConfig จากการตั้งค่าปัจจุบัน
   */
  public getConfig(): EQConfig {
    return {
      enabled: this.isEnabled,
      gains: [...this.gains],
      boostLevel: this.getBoostLevel(),
      inputVolume: this.inputNode.gain.value,
      outputVolume: this.outputNode.gain.value,
      volumeCompensation: this.defaultCompensation,
    };
  }
}
