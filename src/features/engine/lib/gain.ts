export class AudioMeter {
  private audio: AudioContext | undefined = undefined;
  private analysers: AnalyserNode[] = [];

  constructor(audio: AudioContext, analysers: AnalyserNode[]) {
    this.audio = audio;
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
