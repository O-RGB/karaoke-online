import { MIDI } from "spessasynth_lib";
import { BaseSynthPlayerEngine } from "../types/synth.type";
import { fixMidiHeader } from "@/lib/karaoke/ncn";
import { Synthesizer as JsSynthesizer } from "js-synthesizer";
import {
  convertTicksToTime,
  currentTickToTime,
  timeToTick,
} from "@/lib/app-control";
import { jsSynthesizerCurrentTime } from "../lib/js-synthesizer";

export class JsSynthPlayerEngine implements BaseSynthPlayerEngine {
  private player: JsSynthesizer | undefined = undefined;
  paused: boolean = false;
  isFinished: boolean = false;
  currentTime: number = 0;
  midiData: MIDI | undefined = undefined;
  duration: number = 0;

  constructor(synth: JsSynthesizer) {
    this.player = synth;
  }

  play(): void {
    this.player?.playPlayer();
    this.paused = false;
  }
  stop(): void {
    this.player?.resetPlayer();
    this.paused = true;
  }
  pause(): void {
    this.player?.stopPlayer();
    this.paused = true;
  }

  async getCurrentTime() {
    // const currentTick = (await this.player?.retrievePlayerCurrentTick()) ?? 0;
    // const timeDivision = this.midiData?.timeDivision;
    // const tempoChanges = this.midiData?.tempoChanges;

    // if (!timeDivision || !tempoChanges) {
    //   return 0;
    // }

    // let tempoMapping: ITempoTimeChange[] = tempoChanges.map((data) => ({
    //   tempo: data.tempo,
    //   time: data.ticks,
    // }));

    // const time = currentTickToTime(timeDivision, currentTick, tempoMapping);

    if (!this.player || !this.midiData?.timeDivision) {
      return 0;
    }

    let time = await jsSynthesizerCurrentTime(
      this.player,
      this.midiData.timeDivision
    );
    return time ? time.currentTime : 0;
  }

  setCurrentTime(time: number): void {
    const timeDivision = this.midiData?.timeDivision;
    const tempoChanges = this.midiData?.tempoChanges;

    if (!timeDivision || !tempoChanges) {
      return;
    }

    let tempoMapping: ITempoTimeChange[] = tempoChanges.map((data) => ({
      tempo: data.tempo,
      time: data.ticks,
    }));

    this.player?.seekPlayer(timeToTick(timeDivision, time, tempoMapping));
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
    await this.player?.addSMFDataToPlayer(midiFileArrayBuffer);

    return parsedMidi;
  }

  setMidiOutput(): void {}
  resetMidiOutput(): void {}
}
