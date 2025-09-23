import {
  BaseSynthEvent,
  BaseSynthPlayerEngine,
} from "../../../types/synth.type";
import {
  CHORUSDEPTH,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "@/features/engine/types/node.type";
import { fixMidiHeader } from "@/lib/karaoke/ncn";
import {
  AudioWorkletNodeSynthesizer,
  Synthesizer as JsSynthesizer,
} from "js-synthesizer";
import { JsSynthEngine } from "../js-synth-engine";
import { DRUM_CHANNEL } from "@/config/value";
import { EventManager } from "../../instrumentals/events";
import { IMidiParseResult } from "@/lib/karaoke/songs/midi/types";
import { parseMidi } from "@/lib/karaoke/songs/midi/reader";
import { MusicLoadAllData } from "@/features/songs/types/songs.type";

export class JsSynthPlayerEngine implements BaseSynthPlayerEngine {
  private player: AudioWorkletNodeSynthesizer | undefined = undefined;
  private engine: JsSynthEngine;
  public paused: boolean = false;
  public isFinished: boolean = false;
  public midiData: IMidiParseResult | undefined = undefined;

  public eventInit?: BaseSynthEvent | undefined;
  public controller = new EventManager<string, number>();
  public musicQuere: MusicLoadAllData | undefined = undefined;
  public mp3SourceNode: AudioBufferSourceNode | undefined;

  private mp3PausedOffset = 0;
  private mp3StartTime = 0;

  addEvent(input: Partial<BaseSynthEvent>): void {
    this.eventInit = { ...this.eventInit, ...input };
  }

  constructor(player: AudioWorkletNodeSynthesizer, engine: JsSynthEngine) {
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
      }
      source.start(0, this.mp3PausedOffset);
      this.mp3StartTime = ctx.currentTime;
      this.mp3SourceNode = source;
    } else {
      await this.player?.playPlayer();
    }

    this.engine.timer?.startTimer();
    this.eventInit?.onPlay?.();
    this.paused = false;
    this.engine.playerUpdated.trigger(["PLAYER", "CHANGE"], 0, "PLAY");
  }

  stop(): void {
    if (!this.musicQuere) return;
    this.mp3SourceNode?.stop();
    this.player?.stopPlayer();
    this.eventInit?.onStop?.();
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
      this.player?.stopPlayer();
    }

    this.engine.timer?.stopTimer();
    this.paused = true;
    this.engine.playerUpdated.trigger(["PLAYER", "CHANGE"], 0, "PAUSE");
  }

  async getCurrentTiming() {
    const currentTick = (await this.player?.retrievePlayerCurrentTick()) ?? 0;
    return currentTick;
  }

  async setCurrentTiming(seconds: number): Promise<void> {
    const wasPlaying = !this.paused;

    this.pause();

    if (this.musicQuere?.musicType === "MP3" && this.mp3SourceNode) {
      this.mp3PausedOffset = seconds;
      const buffer = this.mp3SourceNode.buffer;
      if (!buffer || !this.engine.audio) return;

      try {
        this.mp3SourceNode.stop();
      } catch {}
      this.mp3SourceNode.disconnect();

      const newSource = this.engine.audio.createBufferSource();
      newSource.buffer = buffer;

      if (this.engine.globalEqualizer) {
        newSource.connect(this.engine.globalEqualizer.input);
      }

      this.engine.timer?.seekTimer(seconds);

      if (wasPlaying) {
        newSource.start(0, seconds);
        this.paused = false;
        this.engine.timer?.startTimer();
        this.eventInit?.onPlay?.();
        this.engine.playerUpdated.trigger(["PLAYER", "CHANGE"], 0, "PLAY");
      } else {
        this.paused = true;
      }

      this.mp3SourceNode = newSource;
    } else {
      this.player?.seekPlayer(seconds);
      setTimeout(() => {
        this.engine.timer?.seekTimer(seconds);
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

  async getCurrentTickAndTempo() {
    const _bpm = (await this.player?.retrievePlayerBpm()) || 0;
    const currentTick = (await this.player?.retrievePlayerCurrentTick()) || 0;
    return { tick: currentTick, tempo: _bpm };
  }

  async prepareMidi(midi: File) {
    this.engine.timer?.seekTimer(0);
    const buffer = await midi.arrayBuffer();
    let midiData: IMidiParseResult;
    let midiBuffer: ArrayBuffer;

    try {
      midiData = await parseMidi(buffer);
      midiBuffer = buffer;
    } catch (error) {
      const fixed = await fixMidiHeader(midi);
      midiBuffer = await fixed.arrayBuffer();
      midiData = await parseMidi(midiBuffer);
    }

    this.midiData = midiData;
    await this.player?.resetPlayer();
    await this.player?.addSMFDataToPlayer(midiBuffer);
    return true;
  }

  async loadMidi(data?: MusicLoadAllData): Promise<boolean> {
    console.log(data);
    if (!data) return false;
    this.stop();
    this.engine.timer?.stopTimer();
    const mid = data.files.midi;
    if (mid !== undefined) {
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

  setMidiOutput(): void {}
  resetMidiOutput(): void {}

  eventChange(): void {
    // this.player?.hookPlayerMIDIEvents((s, type, event) => {
    //   const eventType = event.getType();
    //   const velocity = event.getVelocity();
    //   const midiNote = event.getKey();
    //   const channel = event.getChannel();
    //   const control = event.getControl();
    //   const value = event.getValue();
    //   const program = event.getProgram();
    //   const node = this.engine.nodes[channel];
    //   if (eventType === 0x90 && this.eventInit?.onNoteOnChangeCallback) {
    //     const transpose = node.transpose?.value;
    //     this.eventInit?.onNoteOnChangeCallback({
    //       channel,
    //       midiNote,
    //       velocity,
    //     });
    //     if (channel !== DRUM_CHANNEL) {
    //       event.setKey(midiNote + (transpose ?? 0));
    //     }
    //   } else if (
    //     eventType === 0x80 &&
    //     this.eventInit?.onNoteOffChangeCallback
    //   ) {
    //     this.eventInit?.onNoteOffChangeCallback({
    //       channel,
    //       midiNote,
    //       velocity,
    //     });
    //   }
    //   switch (type) {
    //     case 176:
    //       if (this.eventInit?.controllerChangeCallback) {
    //         let controllerNumber = 0;
    //         let controllerValue = value;
    //         let isLocked = false;
    //         switch (control) {
    //           case MAIN_VOLUME:
    //             let volume = node.volume;
    //             controllerNumber = MAIN_VOLUME;
    //             if (volume?.isLocked) {
    //               isLocked = true;
    //               controllerValue = volume.value ?? value;
    //               event.setValue(controllerValue);
    //             } else if (volume?.isMute) {
    //               event.setValue(0);
    //               controllerValue = 0;
    //             }
    //             break;
    //           case PAN:
    //             controllerNumber = PAN;
    //             let pan = node.pan;
    //             if (pan?.isLocked) {
    //               isLocked = true;
    //               controllerValue = pan.value ?? value;
    //               event.setValue(controllerValue);
    //             } else if (pan?.isMute) {
    //               event.setValue(0);
    //               controllerValue = 0;
    //             }
    //             break;
    //           case REVERB:
    //             controllerNumber = REVERB;
    //             let reverb = node.reverb;
    //             if (reverb?.isLocked) {
    //               isLocked = true;
    //               controllerValue = reverb.value ?? value;
    //               event.setValue(controllerValue);
    //             } else if (reverb?.isMute) {
    //               event.setValue(0);
    //               controllerValue = 0;
    //             }
    //             break;
    //           case CHORUSDEPTH:
    //             controllerNumber = CHORUSDEPTH;
    //             let chorus = node.chorus;
    //             if (chorus?.isLocked) {
    //               isLocked = true;
    //               controllerValue = chorus?.value ?? value;
    //               event.setValue(controllerValue);
    //             } else if (chorus?.isMute) {
    //               event.setValue(0);
    //               controllerValue = 0;
    //             }
    //             break;
    //         }
    //         this.eventInit.controllerChangeCallback({
    //           controllerNumber,
    //           controllerValue,
    //           channel,
    //         });
    //       }
    //       break;
    //     case 192:
    //       if (this.eventInit?.programChangeCallback) {
    //         this.eventInit?.programChangeCallback({
    //           program,
    //           channel,
    //         });
    //       }
    //       break;
    //   }
    //   return false;
    // });
  }
}
