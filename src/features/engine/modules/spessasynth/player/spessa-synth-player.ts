import { MIDI, Sequencer } from "spessasynth_lib";
import { fixMidiHeader } from "@/lib/karaoke/ncn";
import { calculateTicks, convertTicksToTime } from "@/lib/app-control";
import { BaseSynthPlayerEngine } from "@/features/engine/types/synth.type";
import { SoundSetting } from "@/features/config/types/config.type";
import { IMidiParseResult } from "@/lib/karaoke/songs/midi/types";
import { SpessaSynthEngine } from "../spessa-synth-engine";
import { parseMidi } from "@/lib/karaoke/songs/midi/reader";
import { MusicLoadAllData } from "@/features/songs/types/songs.type";
export class SpessaPlayerEngine implements BaseSynthPlayerEngine {
  private player: Sequencer;
  public paused: boolean = false;
  private engine: SpessaSynthEngine;
  public isFinished: boolean = false;
  public midiData: IMidiParseResult | undefined = undefined;
  public config?: Partial<SoundSetting>;
  public musicQuere: MusicLoadAllData | undefined = undefined;
  public mp3SourceNode: AudioBufferSourceNode | undefined;

  private mp3PausedOffset = 0;
  private mp3StartTime = 0;

  constructor(player: Sequencer, engine: SpessaSynthEngine) {
    this.player = player;
    this.engine = engine;
  }
  async play(): Promise<void> {
    if (!this.musicQuere) return;

    if (this.musicQuere.musicType === "MP3" && this.mp3SourceNode?.buffer) {
      const buffer = this.mp3SourceNode.buffer;
      const ctx = this.engine.audio!;
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      if (this.engine.globalEqualizer) {
        source.connect(this.engine.globalEqualizer.input);
      } else {
        source.connect(ctx.destination);
      }

      source.start(0, this.mp3PausedOffset);

      this.mp3StartTime = ctx.currentTime;
      this.mp3SourceNode = source;
    } else {
      this.player.play();
    }

    this.engine.timer?.startTimer();
    this.paused = false;
    this.engine.playerUpdated.trigger(["PLAYER", "CHANGE"], 0, "PLAY");
  }

  stop(): void {
    if (!this.musicQuere) return;

    this.mp3SourceNode?.stop();
    this.player.stop();
    this.engine.timer?.stopTimer();
    this.paused = true;
    this.engine.playerUpdated.trigger(["PLAYER", "CHANGE"], 0, "STOP");
  }

  pause(): void {
    if (!this.musicQuere) return;

    if (this.musicQuere.musicType === "MP3" && this.mp3SourceNode) {
      const ctx = this.engine.audio!;
      const elapsed = ctx.currentTime - this.mp3StartTime;

      this.mp3PausedOffset += elapsed;

      try {
        this.mp3SourceNode.stop();
      } catch {}
      this.mp3SourceNode.disconnect();
    } else {
      this.player.pause();
    }

    this.engine.timer?.stopTimer();
    this.paused = true;
    this.engine.playerUpdated.trigger(["PLAYER", "CHANGE"], 0, "PAUSE");
  }

  async getCurrentTiming() {
    return this.player.currentTime ?? 0;
  }
  async setCurrentTiming(timing: number): Promise<void> {
    const wasPlaying = !this.paused;
    this.pause();

    if (this.musicQuere?.musicType === "MP3") {
      if (!this.engine.audio || !this.mp3SourceNode?.buffer) return;

      try {
        this.mp3SourceNode.stop();
      } catch (_) {}

      this.mp3SourceNode.disconnect();

      const newNode = this.engine.audio.createBufferSource();
      newNode.buffer = this.mp3SourceNode.buffer;

      const outputNode = this.engine.globalEqualizer
        ? this.engine.globalEqualizer.input
        : this.engine.audio.destination;

      newNode.connect(outputNode);

      this.engine.timer?.seekTimer(timing);

      if (wasPlaying) {
        newNode.start(0, timing);
        this.paused = false;
        this.engine.timer?.startTimer();
        this.engine.playerUpdated.trigger(["PLAYER", "CHANGE"], 0, "PLAY");
      } else {
        this.paused = true;
      }

      this.mp3SourceNode = newNode;
    } else {
      if (!this.player) return;
      this.player.currentTime = timing;
      setTimeout(() => {
        this.engine.timer?.seekTimer(timing);
        if (wasPlaying) this.play();
      }, 500);
    }
  }

  tempoUpdate(tempo: number): void {
    this.engine.tempoUpdated.trigger(["TEMPO", "CHANGE"], 0, tempo);
  }

  timingUpdate(tickOrTime: number): void {
    this.engine.timerUpdated.trigger(["TIMING", "CHANGE"], 0, tickOrTime);
  }

  countDownUpdate(time: number): void {
    this.engine.countdownUpdated.trigger(["COUNTDOWN", "CHANGE"], 0, time);
  }

  async getCurrentTickAndTempo(
    timeDivision: number,
    currentTime: number,
    tempos: ITempoChange[]
  ) {
    const tempoTimeChange = convertTicksToTime(timeDivision, tempos);
    return calculateTicks(timeDivision, currentTime, tempoTimeChange);
  }

  async prepareMidi(midi: File) {
    this.engine.timer?.seekTimer(0);
    let midiFileArrayBuffer = await midi.arrayBuffer();
    let parsedMidi: MIDI | null = null;
    let midiData: IMidiParseResult;
    try {
      parsedMidi = new MIDI(midiFileArrayBuffer, midi.name);
      midiData = await parseMidi(midi);
    } catch (e) {
      console.error(e);
      const fix = await fixMidiHeader(midi);
      const fixArrayBuffer = await fix.arrayBuffer();
      parsedMidi = new MIDI(fixArrayBuffer, fix.name);
      midiData = await parseMidi(fix);
    }

    this.midiData = midiData;
    this.player.loadNewSongList([parsedMidi], false);

    return true;
  }

  async loadMp3(file: File): Promise<boolean> {
    if (!this.engine.audio) {
      console.error("AudioContext is not initialized.");
      return false;
    }

    try {
      this.engine.timer?.seekTimer(0);
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.engine.audio.decodeAudioData(arrayBuffer);
      this.mp3SourceNode = this.engine.audio.createBufferSource();
      this.mp3SourceNode.buffer = audioBuffer;
      if (this.engine.globalEqualizer) {
        this.mp3SourceNode.connect(this.engine.globalEqualizer.input);
      }

      return true;
    } catch (error) {
      console.error("Error loading MP3:", error);
      this.mp3SourceNode = undefined;
      return false;
    }
  }

  async loadMidi(data?: MusicLoadAllData): Promise<boolean> {
    if (!data) return false;
    this.stop();
    this.engine.timer?.stopTimer();
    const mid = data.files.midi;
    if (mid !== undefined) {
      this.mp3SourceNode = undefined;
      this.engine.timer?.updateMusic(data);
      this.engine.timer?.updateTempoMap(data.tempoRange);
      this.engine.timer?.updatePpq((data.metadata as any).ticksPerBeat);
      this.musicQuere = data;
      this.engine.musicUpdated.trigger(["MUSIC", "CHANGE"], 0, data);
      return !!this.prepareMidi(mid);
    }

    const mp3 = data.files.mp3;
    if (mp3 != undefined) {
      this.engine.timer?.updateMusic(data);
      this.musicQuere = data;
      this.engine.musicUpdated.trigger(["MUSIC", "CHANGE"], 0, data);
      return this.loadMp3(mp3);
    }
    return false;
  }

  setPlayBackRate(rate: number) {
    this.player.playbackRate = rate;
  }

  setMidiOutput(output: MIDIOutput): void {
    this.player.connectMidiOutput(output);
  }
  resetMidiOutput(): void {
    this.player.resetMIDIOut();
  }
}
