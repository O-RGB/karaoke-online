import { MIDI } from "spessasynth_lib";
import {
  BaseSynthEvent,
  BaseSynthPlayerEngine,
} from "../../../types/synth.type";
import { fixMidiHeader } from "@/lib/karaoke/ncn";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";
import {
  CHORUSDEPTH,
  MAIN_VOLUME,
  PAN,
  REVERB,
} from "@/features/engine/types/node.type";
import { JsSynthEngine } from "../js-synth-engine";

export class JsSynthPlayerEngine implements BaseSynthPlayerEngine {
  private player: JsSynthesizer | undefined = undefined;
  private engine: JsSynthEngine;
  public paused: boolean = false;
  public isFinished: boolean = false;
  public currentTiming: number = 0;
  public midiData: MIDI | undefined = undefined;
  public duration: number = 0;
  public durationTiming: number = 0;
  public eventInit?: BaseSynthEvent | undefined;

  addEvent(input: Partial<BaseSynthEvent>): void {
    this.eventInit = { ...this.eventInit, ...input };
  }

  constructor(player: JsSynthesizer, engine: JsSynthEngine) {
    this.player = player;
    this.engine = engine;
  }

  play(): void {
    this.player?.playPlayer();
    this.paused = false;
  }
  stop(): void {
    this.player?.stopPlayer();
    this.paused = true;
  }
  pause(): void {
    this.player?.stopPlayer();
    this.paused = true;
  }

  async getCurrentTiming() {
    const currentTick = (await this.player?.retrievePlayerCurrentTick()) ?? 0;
    return currentTick;
  }

  setCurrentTiming(tick: number): void {
    this.player?.seekPlayer(tick);
  }

  async getCurrentTickAndTempo() {
    const _bpm = (await this.player?.retrievePlayerBpm()) || 0;
    const currentTick = (await this.player?.retrievePlayerCurrentTick()) || 0;

    return { tick: currentTick, tempo: _bpm };
  }

  async loadMidi(midi: File) {
    let midiFileArrayBuffer = await midi.arrayBuffer();
    let parsedMidi: MIDI | null = null;
    try {
      parsedMidi = new MIDI(midiFileArrayBuffer, midi.name);
    } catch (e) {
      console.error(e);
      const fix = await fixMidiHeader(midi);
      midiFileArrayBuffer = await fix.arrayBuffer();
      parsedMidi = new MIDI(midiFileArrayBuffer, fix.name);
    }
    this.midiData = parsedMidi;
    this.duration = parsedMidi.duration;
    await this.player?.resetPlayer();
    await this.player?.addSMFDataToPlayer(midiFileArrayBuffer);

    return parsedMidi;
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
        this.eventInit?.onNoteOnChangeCallback({
          channel,
          midiNote,
          velocity,
        });
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
        case 176: // Controller Change
          if (this.eventInit?.controllerChangeCallback) {
            let controller = control;
            let controllerNumber = 0;
            let controllerValue = value;
            switch (control) {
              case MAIN_VOLUME:
                controllerNumber = MAIN_VOLUME;
                break;
              case PAN:
                controllerNumber = PAN;
              case REVERB:
                controllerNumber = REVERB;
              case CHORUSDEPTH:
                controllerNumber = CHORUSDEPTH;
              default:
                controllerNumber = controller;
                break;
            }

            this.eventInit.controllerChangeCallback({
              controllerNumber,
              controllerValue,
              channel,
            });
          }
          break;

        case 192: // Program Change
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
