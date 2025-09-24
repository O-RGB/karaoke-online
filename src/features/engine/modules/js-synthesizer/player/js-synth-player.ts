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
import { Synthesizer as JsSynthesizer } from "js-synthesizer";
import { JsSynthEngine } from "../js-synth-engine";
import { DRUM_CHANNEL } from "@/config/value";
import { EventManager } from "../../instrumentals/events";
import { IMidiParseResult } from "@/lib/karaoke/songs/midi/types";
import { parseMidi } from "@/lib/karaoke/songs/midi/reader";
import { MusicLoadAllData } from "@/features/songs/types/songs.type";

export class JsSynthPlayerEngine implements BaseSynthPlayerEngine {
  private player: JsSynthesizer | undefined = undefined;
  private engine: JsSynthEngine;
  public paused: boolean = false;
  public isFinished: boolean = false;
  public midiData: IMidiParseResult | undefined = undefined;

  public eventInit?: BaseSynthEvent | undefined;
  public controller = new EventManager<string, number>();
  public musicQuere: MusicLoadAllData | undefined = undefined;

  // ✅ ใช้ HTMLAudioElement แทน AudioBufferSourceNode
  public mp3Element?: HTMLAudioElement;

  private mp3PausedOffset = 0;

  addEvent(input: Partial<BaseSynthEvent>): void {
    this.eventInit = { ...this.eventInit, ...input };
  }

  constructor(player: JsSynthesizer, engine: JsSynthEngine) {
    this.player = player;
    this.engine = engine;
  }

  async play(): Promise<void> {
    if (!this.musicQuere) return;

    if (this.musicQuere.musicType === "MP3" && this.mp3Element) {
      await this.mp3Element.play(); // ✅ เล่น mp3 ผ่าน <audio>
      this.mp3Element.currentTime = this.mp3PausedOffset;
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

    if (this.musicQuere.musicType === "MP3" && this.mp3Element) {
      this.mp3Element.pause();
      this.mp3Element.currentTime = 0;
      this.mp3PausedOffset = 0;
    } else {
      this.player?.stopPlayer();
    }

    this.engine.timer?.stopTimer();
    this.paused = true;
    this.engine.playerUpdated.trigger(["PLAYER", "CHANGE"], 0, "STOP");
  }

  pause(): void {
    if (!this.musicQuere) return;

    if (this.musicQuere.musicType === "MP3" && this.mp3Element) {
      this.mp3PausedOffset = this.mp3Element.currentTime;
      this.mp3Element.pause();
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

    if (this.musicQuere?.musicType === "MP3" && this.mp3Element) {
      this.mp3PausedOffset = seconds;
      this.mp3Element.currentTime = seconds;
      this.engine.timer?.seekTimer(seconds);

      if (wasPlaying) {
        await this.mp3Element.play();
        this.paused = false;
        this.engine.timer?.startTimer();
        this.eventInit?.onPlay?.();
        this.engine.playerUpdated.trigger(["PLAYER", "CHANGE"], 0, "PLAY");
      }
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

  // ✅ แก้ไข loadMp3
  async loadMp3(file: File): Promise<boolean> {
    if (!this.engine.audio) {
      console.error("AudioContext is not initialized.");
      return false;
    }

    try {
      this.engine.timer?.seekTimer(0);

      const audioEl = new Audio(URL.createObjectURL(file));
      audioEl.crossOrigin = "anonymous";
      audioEl.preload = "auto";

      const track = this.engine.audio.createMediaElementSource(audioEl);
      if (this.engine.globalEqualizer) {
        track.connect(this.engine.globalEqualizer.input);
      }

      this.mp3Element = audioEl;
      this.mp3PausedOffset = 0;

      return true;
    } catch (error) {
      console.error("Error loading MP3:", error);
      this.mp3Element = undefined;
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
    this.player?.hookPlayerMIDIEvents((s, type, event) => {
      const eventType = event.getType();
      const velocity = event.getVelocity();
      const midiNote = event.getKey();
      const channel = event.getChannel();
      const control = event.getControl();
      const value = event.getValue();
      const program = event.getProgram();
      const node = this.engine.nodes[channel];

      if (eventType === 0x90 && this.eventInit?.onNoteOnChangeCallback) {
        const transpose = node.transpose?.value;
        this.eventInit?.onNoteOnChangeCallback({
          channel,
          midiNote,
          velocity,
        });
        if (channel !== DRUM_CHANNEL) {
          event.setKey(midiNote + (transpose ?? 0));
        }
      } else if (
        eventType === 0x80 &&
        this.eventInit?.onNoteOffChangeCallback
      ) {
        this.eventInit?.onNoteOffChangeCallback({
          channel,
          midiNote,
          velocity,
        });
      }

      switch (type) {
        case 176:
          if (this.eventInit?.controllerChangeCallback) {
            let controllerNumber = 0;
            let controllerValue = value;
            let isLocked = false;
            switch (control) {
              case MAIN_VOLUME:
                let volume = node.volume;
                controllerNumber = MAIN_VOLUME;
                if (volume?.isLocked) {
                  isLocked = true;
                  controllerValue = volume.value ?? value;
                  event.setValue(controllerValue);
                } else if (volume?.isMute) {
                  event.setValue(0);
                  controllerValue = 0;
                }
                break;
              case PAN:
                controllerNumber = PAN;
                let pan = node.pan;
                if (pan?.isLocked) {
                  isLocked = true;
                  controllerValue = pan.value ?? value;
                  event.setValue(controllerValue);
                } else if (pan?.isMute) {
                  event.setValue(0);
                  controllerValue = 0;
                }
                break;
              case REVERB:
                controllerNumber = REVERB;
                let reverb = node.reverb;
                if (reverb?.isLocked) {
                  isLocked = true;
                  controllerValue = reverb.value ?? value;
                  event.setValue(controllerValue);
                } else if (reverb?.isMute) {
                  event.setValue(0);
                  controllerValue = 0;
                }
                break;
              case CHORUSDEPTH:
                controllerNumber = CHORUSDEPTH;
                let chorus = node.chorus;
                if (chorus?.isLocked) {
                  isLocked = true;
                  controllerValue = chorus?.value ?? value;
                  event.setValue(controllerValue);
                } else if (chorus?.isMute) {
                  event.setValue(0);
                  controllerValue = 0;
                }
                break;
            }

            this.eventInit.controllerChangeCallback({
              controllerNumber,
              controllerValue,
              channel,
            });
          }
          break;

        case 192:
          if (this.eventInit?.programChangeCallback) {
            this.eventInit?.programChangeCallback({
              program,
              channel,
            });
          }
          break;
      }

      return false;
    });
  }
}
